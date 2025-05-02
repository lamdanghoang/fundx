import { differenceInDays, differenceInHours } from "date-fns";

const TimeLeft = ({ deadline, now }: { deadline: number; now: number }) => {
  const timeDifferenceInDays = differenceInDays(deadline, now);
  const timeDifferenceInHours = differenceInHours(deadline, now);

  let timeLeftText: string;

  if (timeDifferenceInDays >= 1) {
    timeLeftText = `${timeDifferenceInDays} days left`;
  } else if (timeDifferenceInHours > 0) {
    timeLeftText = `${timeDifferenceInHours} hours left`;
  } else {
    timeLeftText = "Expired";
  }

  return <span>{timeLeftText}</span>;
};

export default TimeLeft;
