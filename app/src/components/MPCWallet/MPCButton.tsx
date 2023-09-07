import { Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export const MPCButton = ({
  hasBeenCompleted,
  onClickHandler,
  onCompletionMessage,
  defaultMessage,
}: {
  hasBeenCompleted: boolean;
  onCompletionMessage: string;
  defaultMessage: string;
  onClickHandler: () => void;
}) => {
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    hasBeenCompleted && setLoading(false);
  }, [hasBeenCompleted]);

  return (
    <Button
      isLoading={isLoading}
      disabled={hasBeenCompleted}
      opacity={hasBeenCompleted && "0.5"}
      colorScheme={hasBeenCompleted ? "green" : "gray"}
      onClick={() => {
        setLoading(true);
        onClickHandler();
      }}
    >
      {hasBeenCompleted ? onCompletionMessage : defaultMessage}
    </Button>
  );
};
