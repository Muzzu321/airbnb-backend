import React, { useEffect, useRef } from 'react';
import { Input } from './input';
import { Button } from './button';
import Icon from './icon';

const Token = ({ value = '', onRemove }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.width = `${Math.min(
      inputRef.current.scrollWidth,
      300
    )}px`;
  }, []);

  return (
    <div className="flex items-center gap-0.5 border rounded-md bg-secondary overflow-hidden">
      <Input
        type={'text'}
        size="1"
        value={value}
        className="p-2 border-0 rounded-none focus-visible:ring-transparent "
        readOnly
        ref={inputRef}
      />
      <Button variant={'ghost'} size={'icon'} type="button" onClick={onRemove}>
        <Icon icon={'close'} size="16" />
      </Button>
    </div>
  );
};

const TokenInput = ({ value = [], onChange, placeholder, ...props }) => {
  const inputRef = useRef(null);
  return (
    <div className="flex flex-wrap gap-2 p-2 border rounded-md [&:has(input:focus)]:border-ring [&:has(input:focus)]:ring-3 [&:has(input:focus)]:ring-ring/60">
      {value.map((item, index) => (
        <Token
          value={item}
          key={`${item}-${index}`}
          onRemove={() => onChange(value.filter((_, i) => i !== index))}
        />
      ))}
      <Input
        className="flex-1 p-2 border-0 rounded-none focus-visible:ring-0 focus-visible:ring-transparent focus-visible:ring-offset-transparent min-w-32"
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newValue = e.target.value.trim();
            if (newValue) {
              onChange([...value, newValue]);
              inputRef.current.value = '';
            }
          }
        }}
        {...props}
        ref={inputRef}
      />
    </div>
  );
};

export default TokenInput;
