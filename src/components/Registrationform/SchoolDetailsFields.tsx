import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { NIGERIAN_STATES, type SchoolFormValues, type SchoolTextField } from "./schoolForm"

interface SchoolDetailsFieldsProps {
  values: SchoolFormValues
  fieldErrors: Record<string, string>
  onChange: (field: SchoolTextField, value: string) => void
}

/** One required text input with its label and server error. */
function TextField({
  id,
  label,
  type,
  placeholder,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  type?: string
  placeholder: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        placeholder={placeholder}
        required
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

/** The school name, prefix, email, address and state fields. */
export function SchoolDetailsFields({ values, fieldErrors, onChange }: SchoolDetailsFieldsProps) {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
      <TextField
        id="schoolName"
        label="School Name*"
        placeholder="Enter school's name"
        value={values.schoolName}
        error={fieldErrors.name}
        onChange={(v) => onChange("schoolName", v)}
      />
      <TextField
        id="schoolPrefix"
        label="School Prefix*"
        placeholder="Enter school prefix"
        value={values.schoolPrefix}
        error={fieldErrors.schoolPrefix}
        onChange={(v) => onChange("schoolPrefix", v)}
      />
      <TextField
        id="emailAddress"
        label="School Email Address*"
        type="email"
        placeholder="Enter school's email address"
        value={values.emailAddress}
        error={fieldErrors.email}
        onChange={(v) => onChange("emailAddress", v)}
      />
      <TextField
        id="physicalAddress"
        label="Physical Address*"
        placeholder="Enter physical address"
        value={values.physicalAddress}
        error={fieldErrors.physicalAddress}
        onChange={(v) => onChange("physicalAddress", v)}
      />

      <div className="space-y-2 relative">
        <Label htmlFor="state">State*</Label>
        <Select value={values.state} onValueChange={(value) => onChange("state", value)}>
          <SelectTrigger className="z-10 relative">
            <SelectValue placeholder="Select state" />
          </SelectTrigger>
          <SelectContent className="absolute z-50 bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
            {NIGERIAN_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
