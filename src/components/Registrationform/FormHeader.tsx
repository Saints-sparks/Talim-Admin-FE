import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

/** The form's top bar: Back, the title, and the submit button. */
export function FormHeader({
  mode,
  isLoading,
  onBack,
}: {
  mode: "create" | "edit"
  isLoading: boolean
  onBack: () => void
}) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
      {/* Back Button */}
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="w-full md:w-auto flex items-center justify-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Title & Description (Center-Aligned on Mobile) */}
      <div className="text-center md:text-left">
        <h1 className="text-md md:text-2xl font-bold">
          {mode === "edit" ? "Edit School Information" : "New School Information"}
        </h1>
        <p className="text-gray-500">{mode === "edit" ? "Update school details" : "Register a new school"}</p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full md:w-auto bg-[#002244] hover:bg-[#002244] disabled:opacity-60"
      >
        {isLoading
          ? mode === "edit"
            ? "Saving…"
            : "Registering…"
          : mode === "edit"
            ? "Save Changes"
            : "Register School"}
      </Button>
    </div>
  )
}
