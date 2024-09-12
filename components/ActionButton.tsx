import { Button } from "./ui/button"
import { cloneElement, isValidElement } from "react"

export const ActionButton = ({ icon, onClick, className }: { icon: React.ReactNode, onClick: () => void, className?: string }) => {
  const iconWithClasses = isValidElement(icon)
    ? cloneElement(icon as React.ReactElement, {
        className: `h-4 w-4 ${(icon as React.ReactElement).props.className || ''}`,
      })
    : icon

  return (
    <Button
      size="icon"
      variant="ghost"
      onClick={onClick}
      className={className}
    >
      {iconWithClasses}
      <span className="sr-only">{typeof icon === 'string' ? icon : 'Action'}</span>
    </Button>
  )
}