import CustomerBottomNav, { type CustomerTab } from '@src/components/customer/CustomerBottomNav';
import Button from '@src/components/generic/Button';
import Icon from '@src/components/generic/Icon';
import Modal from '@src/components/generic/Modal';
import { BookingsService, type Booking } from '@src/services/booking-service';
import { PunchCardsService, type PunchCard } from '@src/services/punch-card-service';
import { WorkoutsService, type Workout } from '@src/services/workout-service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const STOCKHOLM = 'Europe/Stockholm';
const dateLabel = new Intl.DateTimeFormat('sv-SE', {
  weekday: 'short', day: 'numeric', month: 'short', timeZone: STOCKHOLM,
});
const timeLabel = new Intl.DateTimeFormat('sv-SE', {
  hour: '2-digit', minute: '2-digit', hour12: false, timeZone: STOCKHOLM,
});
const dateKey = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric', month: '2-digit', day: '2-digit', timeZone: STOCKHOLM,
});

function formatDate(iso: string): string {
  return dateLabel.format(new Date(iso));
}

function formatTimeRange(start: string, end: string): string {
  return `${timeLabel.format(new Date(start))}–${timeLabel.format(new Date(end))}`;
}

function isCardValidFor(card: PunchCard, startsAt: string): boolean {
  const day = dateKey.format(new Date(startsAt));
  return card.status === 'active'
    && card.remaining_credits > 0
    && day >= card.valid_from
    && day <= card.valid_until;
}

function canCancel(booking: Booking, now: number): boolean {
  return booking.status === 'booked'
    && booking.workout_status === 'scheduled'
    && new Date(booking.workout_starts_at).getTime() - now >= 6 * 60 * 60 * 1000;
}

interface WorkoutRowProps {
  workout: Workout;
  booking?: Booking;
  cardAvailable: boolean;
  busy: boolean;
  now: number;
  onBook: (workout: Workout) => void;
  onCancel: (booking: Booking) => void;
}

function workoutIcon(title: string): string {
  if (/yoga|stretch|mobility|rörlighet/i.test(title)) return 'favorite';
  return 'fitness_center';
}

function WorkoutRow({ workout, booking, cardAvailable, busy, now, onBook, onCancel }: WorkoutRowProps) {
  const fullyBooked = workout.available_slots <= 0;
  const bookable = workout.status === 'scheduled'
    && new Date(workout.starts_at).getTime() > now
    && !fullyBooked && cardAvailable;

  return (
    <article className="customer-workout-row">
      <div className="customer-workout-row__icon"><Icon name={workoutIcon(workout.title)} size="large" /></div>
      <div className="customer-workout-row__info">
        <strong>{workout.title}</strong>
        <span className="customer-workout-row__time">
          {formatDate(workout.starts_at)} · {formatTimeRange(workout.starts_at, workout.ends_at)}
        </span>
        <span className={fullyBooked ? 'customer-workout-row__full' : 'customer-workout-row__available'}>
          <span className="customer-workout-row__dot" />
          {fullyBooked ? 'Fullbokat' : `${workout.available_slots} lediga platser`}
        </span>
      </div>
      {booking ? (
        canCancel(booking, now) ? (
          <Button size="small" outlined variant="primary" disabled={busy} onClick={() => onCancel(booking)}>
            Avboka
          </Button>
        ) : (
          <span className="tag is-light">Bokad</span>
        )
      ) : (
        <Button size="small" variant="primary" disabled={!bookable || busy} onClick={() => onBook(workout)}>
          Boka
        </Button>
      )}
    </article>
  );
}

export default function Customer() {
  const [tab, setTab] = useState<CustomerTab>('overview');
  const [now, setNow] = useState(() => Date.now());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cards, setCards] = useState<PunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedCardId, setSelectedCardId] = useState('');

  const refresh = useCallback(async () => {
    const [nextWorkouts, nextBookings, nextCards] = await Promise.all([
      WorkoutsService.getAll(),
      BookingsService.getMyBookings(),
      PunchCardsService.getMyPunchCards(),
    ]);
    setWorkouts(nextWorkouts);
    setBookings(nextBookings);
    setCards(nextCards);
    setNow(Date.now());
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      WorkoutsService.getAll(),
      BookingsService.getMyBookings(),
      PunchCardsService.getMyPunchCards(),
    ]).then(([nextWorkouts, nextBookings, nextCards]) => {
      if (!active) return;
      setWorkouts(nextWorkouts);
      setBookings(nextBookings);
      setCards(nextCards);
      setNow(Date.now());
      setLoadError(false);
    }).catch(() => {
      if (active) setLoadError(true);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const futureWorkouts = useMemo(() => workouts
    .filter((workout) => workout.status === 'scheduled' && new Date(workout.starts_at).getTime() > now)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()), [workouts, now]);

  const futureBookings = useMemo(() => bookings
    .filter((booking) => booking.status === 'booked' && booking.workout_status === 'scheduled'
      && new Date(booking.workout_starts_at).getTime() > now)
    .sort((a, b) => new Date(a.workout_starts_at).getTime() - new Date(b.workout_starts_at).getTime()), [bookings, now]);

  const bookedByWorkout = useMemo(() => new Map(futureBookings.map((booking) => [booking.workout_id, booking])), [futureBookings]);
  const nextBooking = futureBookings[0];
  const activeCards = cards.filter((card) => card.status === 'active' && card.valid_until >= dateKey.format(new Date(now)));
  const remainingCredits = activeCards.reduce((total, card) => total + card.remaining_credits, 0);
  const highlightedCard = activeCards.find((card) => card.remaining_credits > 0) ?? activeCards[0];

  function openBooking(workout: Workout) {
    const candidates = cards.filter((card) => isCardValidFor(card, workout.starts_at));
    if (!candidates.length) {
      toast.error('Du saknar ett giltigt klippkort för detta pass.');
      return;
    }
    setSelectedCardId(candidates[0].id);
    setSelectedWorkout(workout);
  }

  async function confirmBooking() {
    if (!selectedWorkout) return;
    const cardId = Number(selectedCardId);
    const workoutId = Number(selectedWorkout.id);
    if (!Number.isSafeInteger(cardId) || !Number.isSafeInteger(workoutId)) {
      toast.error('Bokningen kunde inte skapas: ogiltigt ID.');
      return;
    }
    setBusy(true);
    try {
      await BookingsService.create({ workoutId, punchCardId: cardId });
      await refresh();
      toast.success('Du är nu bokad!');
      setSelectedWorkout(null);
    } catch {
      toast.error('Bokningen kunde inte genomföras. Kontrollera klippkort och lediga platser.');
    } finally {
      setBusy(false);
    }
  }

  async function confirmCancellation() {
    if (!selectedBooking) return;
    setBusy(true);
    try {
      await BookingsService.cancel(selectedBooking.id);
      await refresh();
      toast.success('Bokningen är avbokad och ditt klipp har återförts.');
      setSelectedBooking(null);
    } catch {
      toast.error('Avbokningen misslyckades. Kontrollera sex­timmarsgränsen och försök igen.');
    } finally {
      setBusy(false);
    }
  }

  function navigate(next: CustomerTab) {
    setTab(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <section className="section customer-dashboard">
      <div className="container customer-dashboard__container">
        <header className="customer-dashboard__topbar">
          <span className="customer-dashboard__brand">SHE LIFTS</span>
        </header>
        {tab !== 'overview' && (
          <div className="customer-dashboard__header">
            <h1 className="title is-4 mb-1">{(
              { workouts: 'Boka pass', bookings: 'Mina bokningar', cards: 'Mina klippkort' } as const
            )[tab]}</h1>
          </div>
        )}

        {loading && <div className="customer-dashboard__message" role="status">Laddar din träningsöversikt…</div>}
        {!loading && loadError && (
          <div className="notification is-danger is-light" role="alert">
            Det gick inte att hämta träningsinformationen.
            <Button variant="danger" outlined size="small" className="mt-3" onClick={() => {
              setLoading(true);
              refresh().then(() => setLoadError(false)).catch(() => toast.error('Kunde inte hämta data.'))
                .finally(() => setLoading(false));
            }}>Försök igen</Button>
          </div>
        )}

        {!loading && !loadError && <>
          {tab === 'overview' && <>
            <section className="customer-next-booking" aria-label="Nästa träningspass">
              <div className="customer-next-booking__content">
                <p className="customer-next-booking__eyebrow">Nästa träningspass</p>
                <h1>{nextBooking ? nextBooking.workout_title : 'Dags att boka ditt nästa pass'}</h1>
                {nextBooking ? (
                  <p className="customer-next-booking__datetime">
                    <span className="customer-next-booking__date"><Icon name="calendar_today" /> {formatDate(nextBooking.workout_starts_at)}</span>
                    <span className="customer-next-booking__date"><Icon name="schedule" /> {formatTimeRange(nextBooking.workout_starts_at, nextBooking.workout_ends_at)}</span>
                  </p>
                ) : (
                  <p className="customer-next-booking__datetime">Se kommande träningstillfällen nedan</p>
                )}
              </div>
              <div className="customer-next-booking__symbol"><Icon name="fitness_center" size="large" /></div>
            </section>

            <button type="button" className="customer-card-summary" onClick={() => navigate('cards')}>
              <span className="customer-card-summary__icon"><Icon name="sell" size="large" /></span>
              <span className="customer-card-summary__body">
                <span className="customer-card-summary__heading">Mitt klippkort</span>
                {highlightedCard ? (
                  <>
                    <span className="customer-card-summary__numbers">
                      <strong>{highlightedCard.punch_card_type_name}</strong>
                      <strong>{highlightedCard.remaining_credits} av {highlightedCard.total_credits} kvar</strong>
                    </span>
                    <span className="customer-card-summary__progress" role="progressbar"
                      aria-valuenow={highlightedCard.remaining_credits} aria-valuemin={0}
                      aria-valuemax={highlightedCard.total_credits} aria-label="Återstående klipp">
                      <span style={{ width: `${highlightedCard.remaining_credits / highlightedCard.total_credits * 100}%` }} />
                    </span>
                    {activeCards.length > 1 && <span className="customer-card-summary__note">Totalt {remainingCredits} klipp på {activeCards.length} aktiva kort</span>}
                  </>
                ) : <strong>Inget aktivt klippkort</strong>}
              </span>
              <Icon name="chevron_right" />
            </button>

            <div className="customer-dashboard__section-heading">
              <div>
                <h2 className="title is-5 mb-0">Kommande pass</h2>
                <p className="customer-dashboard__section-description">Hitta ditt nästa pass</p>
              </div>
              <button type="button" className="customer-dashboard__text-action" onClick={() => navigate('workouts')}>Se alla <Icon name="arrow_forward" /></button>
            </div>
            {futureWorkouts.length === 0 && <p className="has-text-grey">Inga kommande pass är planerade.</p>}
            {futureWorkouts.slice(0, 3).map((workout) => <WorkoutRow
              key={workout.id} workout={workout} booking={bookedByWorkout.get(workout.id)} busy={busy} now={now}
              cardAvailable={cards.some((card) => isCardValidFor(card, workout.starts_at))}
              onBook={openBooking} onCancel={setSelectedBooking}
            />)}
          </>}

          {tab === 'workouts' && <>
            <p className="has-text-grey mb-4">Se och boka kommande träningspass.</p>
            {futureWorkouts.length === 0 && <p>Inga kommande pass är planerade.</p>}
            {futureWorkouts.map((workout) => <WorkoutRow
              key={workout.id} workout={workout} booking={bookedByWorkout.get(workout.id)} busy={busy} now={now}
              cardAvailable={cards.some((card) => isCardValidFor(card, workout.starts_at))}
              onBook={openBooking} onCancel={setSelectedBooking}
            />)}
          </>}

          {tab === 'bookings' && <>
            {futureBookings.length === 0 && <p className="has-text-grey mb-4">Du har inga kommande bokningar.</p>}
            {futureBookings.map((booking) => <article className="customer-booking-card" key={booking.id}>
              <div><strong>{booking.workout_title}</strong>
                <p>{formatDate(booking.workout_starts_at)} · {formatTimeRange(booking.workout_starts_at, booking.workout_ends_at)}</p>
              </div>
              {canCancel(booking, now) ? <Button variant="primary" outlined size="small" disabled={busy} onClick={() => setSelectedBooking(booking)}>Avboka</Button>
                : <span className="tag is-light">Bokad</span>}
            </article>)}
          </>}

          {tab === 'cards' && <>
            {cards.length === 0 && <p className="has-text-grey">Du har inga klippkort ännu.</p>}
            {cards.map((card) => <article className="customer-punch-card" key={card.id}>
              <div className="is-flex is-justify-content-space-between is-align-items-center mb-2">
                <strong>{card.punch_card_type_name}</strong>
                <span className="tag is-light">{card.status === 'revoked' ? 'Återkallat' : card.valid_until < dateKey.format(new Date(now)) ? 'Utgånget' : 'Aktivt'}</span>
              </div>
              <p className="customer-punch-card__number">{card.remaining_credits} av {card.total_credits} kvar</p>
              <progress className="progress is-primary is-small my-3" value={card.remaining_credits} max={card.total_credits}>{card.remaining_credits}</progress>
              <p className="is-size-7 has-text-grey">Giltigt till {card.valid_until}</p>
            </article>)}
          </>}
        </>}
      </div>

      <CustomerBottomNav activeTab={tab} onNavigate={navigate} />

      <Modal isOpen={selectedWorkout !== null} title="Bekräfta bokning" onClose={() => { if (!busy) setSelectedWorkout(null); }}
        footer={<>
          <Button variant="light" disabled={busy} onClick={() => setSelectedWorkout(null)}>Avbryt</Button>
          <Button variant="primary" isLoading={busy} onClick={confirmBooking}>Boka pass</Button>
        </>}>
        {selectedWorkout && <>
          <p className="has-text-weight-semibold mb-2">{selectedWorkout.title}</p>
          <p className="mb-4">{formatDate(selectedWorkout.starts_at)}, {formatTimeRange(selectedWorkout.starts_at, selectedWorkout.ends_at)}</p>
          <label className="label" htmlFor="booking-card">Använd klippkort</label>
          <div className="select is-fullwidth"><select id="booking-card" value={selectedCardId} onChange={(event) => setSelectedCardId(event.target.value)}>
            {cards.filter((card) => isCardValidFor(card, selectedWorkout.starts_at)).map((card) => <option value={card.id} key={card.id}>
              {card.punch_card_type_name} ({card.remaining_credits} kvar)
            </option>)}
          </select></div>
        </>}
      </Modal>

      <Modal isOpen={selectedBooking !== null} title="Avboka träningspass" onClose={() => { if (!busy) setSelectedBooking(null); }}
        footer={<>
          <Button variant="light" disabled={busy} onClick={() => setSelectedBooking(null)}>Behåll bokning</Button>
          <Button variant="primary" outlined isLoading={busy} onClick={confirmCancellation}>Ja, avboka</Button>
        </>}>
        {selectedBooking && <p>Vill du avboka <strong>{selectedBooking.workout_title}</strong> {formatDate(selectedBooking.workout_starts_at)}? Ditt klipp återförs vid godkänd avbokning.</p>}
      </Modal>
    </section>
  );
}
