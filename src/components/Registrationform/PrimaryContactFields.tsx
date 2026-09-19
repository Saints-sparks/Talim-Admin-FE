import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PrimaryContact } from "@/app/services/school.service"

interface ContactFieldSpec {
  field: keyof PrimaryContact
  /** Prefix of the input's id; the contact's index follows it. */
  idPrefix: string
  label: string
  placeholder: string
  type?: string
}

const CONTACT_FIELDS: ContactFieldSpec[] = [
  { field: "name", idPrefix: "contactName", label: "Name*", placeholder: "Enter contact name" },
  { field: "phone", idPrefix: "contactPhone", label: "Phone*", placeholder: "Enter phone number" },
  { field: "email", idPrefix: "contactEmail", label: "Email*", placeholder: "Enter email address", type: "email" },
  { field: "role", idPrefix: "contactRole", label: "Role*", placeholder: "Enter role" },
]

interface PrimaryContactFieldsProps {
  contacts: PrimaryContact[]
  onChange: (index: number, field: keyof PrimaryContact, value: string) => void
}

/** The name, phone, email and role inputs of each primary contact. */
export function PrimaryContactFields({ contacts, onChange }: PrimaryContactFieldsProps) {
  return (
    <>
      {contacts.map((contact, index) => (
        <div key={index} className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 mb-6">
          {CONTACT_FIELDS.map((spec) => (
            <div key={spec.field} className="space-y-2 max-w-lg">
              <Label htmlFor={`${spec.idPrefix}${index}`}>{spec.label}</Label>
              <Input
                id={`${spec.idPrefix}${index}`}
                type={spec.type}
                value={contact[spec.field]}
                onChange={(e) => onChange(index, spec.field, e.target.value)}
                placeholder={spec.placeholder}
                required
                className="w-full"
              />
            </div>
          ))}
        </div>
      ))}
    </>
  )
}
