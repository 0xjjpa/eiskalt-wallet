import { Button } from "@chakra-ui/react";
import { useState } from "react";

export const MPCButton = ({
  hasBeenCompleted,
  onClickHandler,
  onCompletionMessage,
  defaultMessage,
}: {
  hasBeenCompleted: boolean;
  onCompletionMessage: string;
  defaultMessage: string;
  onClickHandler: (hasBeenCompletedCallback: () => void) => void;
}) => {
  const [isLoading, setLoading] = useState(false);
  return (
    <Button
      isLoading={isLoading}
      disabled={hasBeenCompleted}
      opacity={hasBeenCompleted && "0.5"}
      colorScheme={hasBeenCompleted ? "green" : "gray"}
      onClick={() => {
        setLoading(true);
        onClickHandler(() => setLoading(false));
      }}
    >
      {hasBeenCompleted ? onCompletionMessage : defaultMessage}
    </Button>
  );
};
