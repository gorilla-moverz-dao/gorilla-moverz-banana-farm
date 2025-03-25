import { Button, Spinner } from "@chakra-ui/react";
import { useState, useEffect } from "react";

export default function FarmCountdown({
  seconds,
  onActivate,
  loading,
}: {
  seconds: number;
  onActivate: () => void;
  loading: boolean;
}) {
  const [timeLeft, setTimeLeft] = useState({
    hours: Math.floor(seconds / 3600),
    mins: Math.floor((seconds % 3600) / 60),
    secs: seconds % 60,
  });

  useEffect(() => {
    // Calculate the target end time
    const endTime = new Date().getTime() + seconds * 1000;

    const interval = setInterval(() => {
      const now = new Date().getTime() - 1000;
      const difference = endTime - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: 0, mins: 0, secs: 0 });
      } else {
        // Convert difference to hours, minutes and seconds
        const hours = Math.floor(difference / (1000 * 60 * 60));
        const mins = Math.floor((difference / (1000 * 60)) % 60);
        const secs = Math.floor((difference / 1000) % 60);
        setTimeLeft({ hours, mins, secs });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const enabled = timeLeft.hours <= 0 && timeLeft.mins <= 0 && timeLeft.secs <= 0;
  const buttonText = enabled
    ? "Farm Bananas"
    : `Farm Bananas in ${timeLeft.hours}:${timeLeft.mins < 10 ? `0${timeLeft.mins}` : timeLeft.mins}:${timeLeft.secs < 10 ? `0${timeLeft.secs}` : timeLeft.secs}`;

  return (
    <Button onClick={onActivate} colorScheme={enabled ? "green" : "gray"} disabled={!enabled}>
      {loading ? (
        <>
          <Spinner marginRight={2} />
          Farming...
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}
