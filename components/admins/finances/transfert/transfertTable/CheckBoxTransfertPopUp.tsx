"use client";

import * as React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ indeterminate, ...props }, ref) => {
    const localRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => localRef.current!);

    React.useEffect(() => {
      if (localRef.current) {
        localRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <input
        type="checkbox"
        ref={localRef}
        {...props}
        className="accent-black"
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
