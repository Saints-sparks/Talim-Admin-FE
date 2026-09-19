/** @jest-environment jsdom */
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils/render';
import { toast } from 'sonner';
import { SchoolRegistrationForm } from '@/components/Registrationform/Form';
import {
  NIGERIAN_STATES,
  buildCreatePayload,
  buildSchoolPayload,
  initialFormValues,
  updateContact,
} from '@/components/Registrationform/schoolForm';
import { schoolService, type School } from '@/app/services/school.service';
import { uploadImage } from '@/app/services/upload.service';
import { ApiError } from '@/lib/apiError';

const push = jest.fn();
const back = jest.fn();

jest.mock('next/navigation', () => ({ useRouter: () => ({ push, back }) }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('@/app/services/school.service', () => ({
  schoolService: { createSchool: jest.fn(), updateSchool: jest.fn() },
}));
jest.mock('@/app/services/upload.service', () => ({
  ...jest.requireActual('@/app/services/upload.service'),
  uploadImage: jest.fn(),
}));

const school = {
  _id: 's1',
  name: 'Sunrise',
  email: 'info@sunrise.test',
  physicalAddress: '1 Main St',
  location: { country: 'Nigeria', state: 'Lagos' },
  schoolPrefix: 'SUN',
  active: false,
  logo: 'https://cdn/logo.png',
  createdAt: '',
  updatedAt: '',
  primaryContacts: [{ name: 'Ada', phone: '0801', email: 'ada@sunrise.test', role: 'Principal', extra: 'x' }],
} as unknown as School;

describe('school form logic', () => {
  it('starts blank with one empty contact', () => {
    const values = initialFormValues();
    expect(values).toMatchObject({ schoolName: '', schoolPrefix: '', state: '', schoolLogo: '' });
    expect(values.primaryContacts).toEqual([{ name: '', phone: '', email: '', role: '' }]);
  });

  it('starts from the school being edited, copying only the contact fields the API declares', () => {
    const values = initialFormValues(school);
    expect(values.schoolName).toBe('Sunrise');
    expect(values.state).toBe('Lagos');
    expect(values.schoolLogo).toBe('https://cdn/logo.png');
    expect(values.primaryContacts).toEqual([
      { name: 'Ada', phone: '0801', email: 'ada@sunrise.test', role: 'Principal' },
    ]);
  });

  it('changes one field of one contact and leaves the rest alone', () => {
    const contacts = [
      { name: 'A', phone: '1', email: 'a@x', role: 'r' },
      { name: 'B', phone: '2', email: 'b@x', role: 'r' },
    ];
    const next = updateContact(contacts, 1, 'phone', '999');
    expect(next[1].phone).toBe('999');
    expect(next[0]).toBe(contacts[0]);
    expect(contacts[1].phone).toBe('2');
  });

  it('builds exactly the fields the DTOs declare', () => {
    const values = initialFormValues(school);
    const update = buildSchoolPayload(values, 'https://cdn/new.png', false);
    expect(Object.keys(update).sort()).toEqual(
      ['active', 'email', 'location', 'logo', 'name', 'physicalAddress', 'primaryContacts'],
    );
    expect(update.location).toEqual({ country: 'Nigeria', state: 'Lagos' });
    expect(update.active).toBe(false);
    expect(buildSchoolPayload(values, 'u').active).toBe(true);
    expect(buildCreatePayload(values, 'u')).toMatchObject({ schoolPrefix: 'SUN', logo: 'u', active: true });
  });

  it('lists the 36 states and the FCT', () => {
    expect(NIGERIAN_STATES).toHaveLength(37);
    expect(NIGERIAN_STATES).toContain('FCT');
  });
});

describe('SchoolRegistrationForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (schoolService.createSchool as jest.Mock).mockResolvedValue({});
    (schoolService.updateSchool as jest.Mock).mockResolvedValue({});
  });

  it('will not save without a logo', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchoolRegistrationForm />);
    await user.type(screen.getByLabelText('School Name*'), 'Sunrise');
    await user.type(screen.getByLabelText('School Prefix*'), 'SUN');
    await user.type(screen.getByLabelText('School Email Address*'), 'a@b.co');
    await user.type(screen.getByLabelText('Physical Address*'), '1 Main St');
    await user.type(screen.getByLabelText('Name*'), 'Ada');
    await user.type(screen.getByLabelText('Phone*'), '0801');
    await user.type(screen.getByLabelText('Email*'), 'ada@b.co');
    await user.type(screen.getByLabelText('Role*'), 'Principal');
    await user.click(screen.getByRole('button', { name: 'Register School' }));
    expect(toast.error).toHaveBeenCalledWith('Add a school logo before saving.');
    expect(schoolService.createSchool).not.toHaveBeenCalled();
  });

  it('saves an edit, keeps the current status, and returns to the list', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchoolRegistrationForm mode="edit" initialData={school} schoolId="s1" />);
    expect(screen.getByRole('heading', { name: 'Edit School Information' })).toBeInTheDocument();
    const name = screen.getByLabelText('School Name*');
    await user.clear(name);
    await user.type(name, 'Sunrise Academy');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(push).toHaveBeenCalledWith('/talimschool'));
    expect(schoolService.updateSchool).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ name: 'Sunrise Academy', active: false, logo: 'https://cdn/logo.png' }),
    );
    expect(schoolService.updateSchool).toHaveBeenCalledWith('s1', expect.not.objectContaining({ schoolPrefix: 'SUN' }));
    expect(toast.success).toHaveBeenCalledWith('School updated');
  });

  it('shows the server\'s per-field errors and a toast when the save is refused', async () => {
    const user = userEvent.setup();
    (schoolService.updateSchool as jest.Mock).mockRejectedValue(
      new ApiError('VALIDATION_FAILED', 'Some fields need attention.', 400, [
        { field: 'email', reason: 'email must be an email' },
      ]),
    );
    renderWithProviders(<SchoolRegistrationForm mode="edit" initialData={school} schoolId="s1" />);
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    expect(await screen.findByText('email must be an email')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('The school could not be updated', expect.anything());
    expect(push).not.toHaveBeenCalled();
  });

  it('uploads a newly picked logo before saving', async () => {
    const user = userEvent.setup();
    (uploadImage as jest.Mock).mockResolvedValue('https://cdn/uploaded.png');
    global.URL.createObjectURL = jest.fn(() => 'blob:preview');
    const { container } = renderWithProviders(
      <SchoolRegistrationForm mode="edit" initialData={school} schoolId="s1" />,
    );
    const input = container.querySelector('#logo-upload') as HTMLInputElement;
    await user.upload(input, new File(['x'], 'logo.png', { type: 'image/png' }));
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => expect(push).toHaveBeenCalled());
    expect(uploadImage).toHaveBeenCalled();
    expect(schoolService.updateSchool).toHaveBeenCalledWith(
      's1',
      expect.objectContaining({ logo: 'https://cdn/uploaded.png' }),
    );
  });

  it('refuses a logo that is not an image', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = renderWithProviders(<SchoolRegistrationForm />);
    const input = container.querySelector('#logo-upload') as HTMLInputElement;
    await user.upload(input, new File(['x'], 'notes.pdf', { type: 'application/pdf' }));
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('not supported'));
  });

  it('removes the logo, and Back does not submit the form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SchoolRegistrationForm mode="edit" initialData={school} schoolId="s1" />);
    expect(screen.getByAltText('School logo preview')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '' }));
    expect(screen.queryByAltText('School logo preview')).toBeNull();

    await user.click(screen.getByRole('button', { name: /Back/ }));
    expect(back).toHaveBeenCalled();
    expect(schoolService.updateSchool).not.toHaveBeenCalled();
  });
});
