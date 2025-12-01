/**
 * Shared Form Components
 *
 * Re-exports all form-related shared components for easy importing.
 *
 * @module components/shared/forms
 */

// Feedback components
export {
    FormFeedback,
    FormSuccessMessage,
    FormErrorMessage,
    type FormFeedbackProps,
    type FormFeedbackStatus,
    type FormFeedbackVariant,
} from './form-feedback.component'

// Submit button
export { SubmitButton, type SubmitButtonProps } from './submit-button.component'

// Form field components
export {
    NameField,
    FirstNameField,
    LastNameField,
    EmailField,
    PhoneField,
    SubjectField,
    MessageField,
    SelectField,
    CheckboxField,
    type FormFieldVariant,
} from './form-fields.component'

// Consultation form
export {
    ConsultationForm,
    type ConsultationFormProps,
} from './consultation-form.component'
