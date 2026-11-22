import Button from '@src/components/generic/Button';
import { DateUtils } from '@src/utils/date-time';

interface WeekSwitcherProps {
  activeMonday: Date;
  onWeekChange: (monday: Date) => void;
}

export default function WeekSwitcher({ activeMonday, onWeekChange }: WeekSwitcherProps) {
  const currentMonday = DateUtils.getFirstDayOfWeek();
  const isCurrentWeek = DateUtils.toISODate(activeMonday) === DateUtils.toISODate(currentMonday);
  const weekNumber = DateUtils.getISOWeekNumber(activeMonday);

  return (
    <div className="box py-3 px-3 mb-5">
      <div className="is-flex is-justify-content-space-between is-align-items-center">
        <Button
          variant="primary"
          size="medium"
          icon="chevron_left"
          onClick={() => onWeekChange(DateUtils.addDays(activeMonday, -7))}
        />

        <div className="has-text-centered">
          <p className="has-text-weight-bold is-size-6">Vecka {weekNumber}</p>
          <p className="is-size-7 has-text-grey">{DateUtils.formatWeekRange(activeMonday)}</p>
        </div>

        <Button
          variant="primary"
          size="medium"
          icon="chevron_right"
          onClick={() => onWeekChange(DateUtils.addDays(activeMonday, 7))}
        />
      </div>

      {!isCurrentWeek && (
        <div className="has-text-centered mt-2">
          <Button variant="ghost" size="small" className="py-0" onClick={() => onWeekChange(currentMonday)}>
            Tillbaka till denna vecka
          </Button>
        </div>
      )}
    </div>
  );
}
