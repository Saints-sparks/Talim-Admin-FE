import type { CreateSchoolData, PrimaryContact, School, UpdateSchoolData } from "@/app/services/school.service"

/** Nigerian states and the FCT, as the State picker lists them. */
export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT", "Gombe", "Imo",
  "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba",
  "Yobe", "Zamfara",
]

/** The registration form as typed. */
export interface SchoolFormValues {
  schoolLogo: string
  schoolName: string
  schoolPrefix: string
  emailAddress: string
  physicalAddress: string
  state: string
  primaryContacts: PrimaryContact[]
}

/** The text fields of the general-information card. */
export type SchoolTextField = "schoolName" | "schoolPrefix" | "emailAddress" | "physicalAddress" | "state"

/** A contact with nothing filled in. */
const BLANK_CONTACT: PrimaryContact = { name: "", phone: "", email: "", role: "" }

/**
 * The form's starting values: the school being edited, or a blank form with
 * one empty contact.
 *
 * @param initialData - The school to edit, when editing.
 * @returns The form values.
 */
export function initialFormValues(initialData?: School): SchoolFormValues {
  return {
    schoolLogo: initialData?.logo || "",
    schoolName: initialData?.name || "",
    schoolPrefix: initialData?.schoolPrefix || "",
    emailAddress: initialData?.email || "",
    physicalAddress: initialData?.physicalAddress || "",
    state: initialData?.location.state || "",
    primaryContacts: initialData?.primaryContacts.map((contact) => ({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      role: contact.role,
    })) || [{ ...BLANK_CONTACT }],
  }
}

/**
 * Changes one field of one contact.
 *
 * @param contacts - The contacts so far.
 * @param index - Which contact.
 * @param field - Which field of it.
 * @param value - The new value.
 * @returns The next contacts; the others are untouched.
 */
export function updateContact(
  contacts: PrimaryContact[],
  index: number,
  field: keyof PrimaryContact,
  value: string,
): PrimaryContact[] {
  return contacts.map((contact, i) => (i === index ? { ...contact, [field]: value } : contact))
}

/**
 * The create / update request body. It holds exactly the fields
 * `CreateSchoolDto` / `UpdateSchoolDto` declare: the API runs
 * `forbidNonWhitelisted`, so one extra key would be a 400.
 *
 * @param values - The form as typed.
 * @param logoUrl - The logo's URL (already uploaded).
 * @param active - The school's current status when editing; new schools start active.
 * @returns The body without `schoolPrefix`, which only creating sends.
 */
export function buildSchoolPayload(values: SchoolFormValues, logoUrl: string, active = true): UpdateSchoolData {
  return {
    name: values.schoolName,
    email: values.emailAddress,
    physicalAddress: values.physicalAddress,
    location: { country: "Nigeria", state: values.state },
    primaryContacts: values.primaryContacts,
    active,
    logo: logoUrl,
  }
}

/**
 * The create body: the update body plus the school prefix.
 *
 * @param values - The form as typed.
 * @param logoUrl - The logo's URL (already uploaded).
 * @returns The body for `POST /schools/create`.
 */
export function buildCreatePayload(values: SchoolFormValues, logoUrl: string): CreateSchoolData {
  return { ...buildSchoolPayload(values, logoUrl), schoolPrefix: values.schoolPrefix }
}
