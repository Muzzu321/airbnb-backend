import React from 'react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from './input-otp';
import { REGEXP_ONLY_DIGITS } from 'input-otp';

const InputDOB = (props) => {
  return (
    <InputOTP {...props} maxLength={8} pattern={REGEXP_ONLY_DIGITS}>
      <InputOTPGroup className="gap-1">
        <InputOTPSlot
          placeholder="Y"
          index={0}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
        <InputOTPSlot
          placeholder="Y"
          index={1}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
        <InputOTPSlot
          placeholder="Y"
          index={2}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
        <InputOTPSlot
          placeholder="Y"
          index={3}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
      </InputOTPGroup>
      <InputOTPSeparator
        className="text-muted-foreground"
      />
      <InputOTPGroup className="gap-1">
        <InputOTPSlot
          placeholder="M"
          index={4}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
        <InputOTPSlot
          placeholder="M"
          index={5}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
      </InputOTPGroup>
      <InputOTPSeparator
        className="text-muted-foreground"
      />
      <InputOTPGroup className="gap-1">
        <InputOTPSlot
          placeholder="D"
          index={6}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
        <InputOTPSlot
          placeholder="D"
          index={7}
          className="w-6 h-10 border-t-0 border-r-0 rounded-none border-y-background border-b-input last:rounded-r-none first:rounded-l-none first:border-l-0"
        />
      </InputOTPGroup>
    </InputOTP>
  );
};

export default InputDOB;
