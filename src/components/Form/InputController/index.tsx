import { Field, Input } from '@chakra-ui/react';
import { Control, Controller, FieldError, FieldValues, Path } from 'react-hook-form';
import { PasswordInput } from '@/components/ui/password-input';
import React from 'react';

interface Props<T extends FieldValues> extends React.ComponentPropsWithoutRef<typeof Input> {
  label: string;
  name: Path<T>;
  control: Control<T>;
  placeholder?: string;
  isRequired?: boolean | string;
  rules?: Record<string, any>;
  isPassword?: boolean;
}

export const InputController = <T extends FieldValues>({
  label,
  name,
  control,
  placeholder,
  isRequired,
  rules,
  isPassword = false,
  ...props
}: Props<T>) => {
  const InputElement = isPassword ? PasswordInput : Input;

  return (
    <Controller
      name={name}
      control={control}
      rules={{
        required: isRequired,
        ...rules,
      }}
      render={({ field, formState }) => {
        const errs = formState.errors as Record<string, FieldError | undefined> | undefined;
        const fieldError = errs?.[name];
        return (
          <Field.Root invalid={!!fieldError}>
            <Field.Label>{label}</Field.Label>
            <InputElement placeholder={placeholder} {...field} {...props} />
            <Field.ErrorText>{fieldError?.message}</Field.ErrorText>
          </Field.Root>
        );
      }}
    />
  );
};
