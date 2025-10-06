import * as React from "react"
import { cn } from "@/lib/utils"

const StepperContext = React.createContext({})

const Stepper = React.forwardRef(({ 
  className, 
  children, 
  orientation = "horizontal",
  variant = "default",
  ...props 
}, ref) => {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState(new Set())

  const contextValue = React.useMemo(() => ({
    currentStep,
    setCurrentStep,
    completedSteps,
    setCompletedSteps,
    orientation,
    variant
  }), [currentStep, completedSteps, orientation, variant])

  return (
    <StepperContext.Provider value={contextValue}>
      <div
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "flex-row items-center" : "flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </StepperContext.Provider>
  )
})
Stepper.displayName = "Stepper"

const StepperList = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      {...props}
    />
  )
})
StepperList.displayName = "StepperList"

const StepperItem = React.forwardRef(({ className, ...props }, ref) => {
  const { orientation } = React.useContext(StepperContext)
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        orientation === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      {...props}
    />
  )
})
StepperItem.displayName = "StepperItem"

const StepperHeader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center", className)}
      {...props}
    />
  )
})
StepperHeader.displayName = "StepperHeader"

const StepperTitle = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  )
})
StepperTitle.displayName = "StepperTitle"

const StepperDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
StepperDescription.displayName = "StepperDescription"

const StepperContent = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("mt-2 min-h-[1.2rem] text-sm text-muted-foreground", className)}
      {...props}
    />
  )
})
StepperContent.displayName = "StepperContent"

const StepperTrigger = React.forwardRef(({ 
  className, 
  children, 
  step,
  onClick,
  ...props 
}, ref) => {
  const { currentStep, setCurrentStep, completedSteps, orientation } = React.useContext(StepperContext)
  
  const isCompleted = completedSteps.has(step)
  const isCurrent = currentStep === step
  
  const handleClick = (e) => {
    if (onClick) {
      onClick(e)
    } else {
      setCurrentStep(step)
    }
  }

  return (
    <button
      ref={ref}
      className={cn(
        "flex items-center gap-2 p-2 rounded-md transition-colors",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        isCurrent && "bg-primary/10 text-primary",
        isCompleted && "text-primary",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
})
StepperTrigger.displayName = "StepperTrigger"

const StepperSeparator = React.forwardRef(({ className, ...props }, ref) => {
  const { currentStep, completedSteps, orientation } = React.useContext(StepperContext)
  const { step } = props
  
  const isCompleted = step !== undefined ? completedSteps.has(step) : false
  
  return (
    <div
      ref={ref}
      className={cn(
        "bg-border transition-colors",
        orientation === "horizontal" 
          ? "h-px w-full mx-2" 
          : "w-px h-full my-2",
        isCompleted && "bg-primary",
        className
      )}
      {...props}
    />
  )
})
StepperSeparator.displayName = "StepperSeparator"

const StepperNumber = React.forwardRef(({ 
  className, 
  step,
  ...props 
}, ref) => {
  const { currentStep, completedSteps } = React.useContext(StepperContext)
  
  const isCompleted = completedSteps.has(step)
  const isCurrent = currentStep === step
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors",
        isCurrent && "border-primary bg-primary text-primary-foreground",
        isCompleted && "border-primary bg-primary text-primary-foreground",
        !isCurrent && !isCompleted && "border-muted-foreground/50 text-muted-foreground",
        className
      )}
      {...props}
    >
      {isCompleted ? (
        <svg
          className="h-4 w-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        step
      )}
    </div>
  )
})
StepperNumber.displayName = "StepperNumber"

export {
  Stepper,
  StepperList,
  StepperItem,
  StepperHeader,
  StepperTitle,
  StepperDescription,
  StepperContent,
  StepperTrigger,
  StepperSeparator,
  StepperNumber,
}
