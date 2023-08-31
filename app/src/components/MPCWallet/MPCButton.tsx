import { Button } from "@chakra-ui/react";

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
  return (
    <Button
      disabled={hasBeenCompleted}
      opacity={hasBeenCompleted && "0.5"}
      colorScheme={hasBeenCompleted ? "green" : "gray"}
      onClick={onClickHandler}
    >
      {hasBeenCompleted ? onCompletionMessage : defaultMessage}
    </Button>
  );
};
