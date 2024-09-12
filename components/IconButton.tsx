import { Button } from "./ui/button"
import { cloneElement, isValidElement } from "react"

export const IconButton = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => {
  const iconWithClasses = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement, {
        className: `h-4 w-4 text-gray-500 ${(icon as React.ReactElement).props.className || ''}`,
      })
    : icon

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
    >
      {iconWithClasses}
    </Button>
  )
}