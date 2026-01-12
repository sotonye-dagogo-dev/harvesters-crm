import { Input as AntInput, InputProps } from "antd";
import { TextAreaProps } from "antd/es/input";

interface CustomInputProps extends InputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, ...props }: CustomInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <AntInput {...props} status={error ? "error" : undefined} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface TextAreaCustomProps extends TextAreaProps {
  label?: string;
  error?: string;
}

export function TextArea({ label, error, ...props }: TextAreaCustomProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <AntInput.TextArea {...props} status={error ? "error" : undefined} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

interface PasswordInputProps extends InputProps {
  label?: string;
  error?: string;
}

export function PasswordInput({ label, error, ...props }: PasswordInputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <AntInput.Password {...props} status={error ? "error" : undefined} />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
