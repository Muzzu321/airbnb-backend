import React from 'react';
import { LinkWithIcon } from './ui/link';

const BackNavigation = ({ text = 'Back', href }) => {
  return (
    <LinkWithIcon
      to={href}
      size="sm"
      className="gap-0.5 text-muted-foreground p-0 hover:no-underline hover:text-foreground"
      variant="link"
      icon="leftArrow"
      iconProps={{ size: 18 }}
    >
      {text}
    </LinkWithIcon>
  );
};

export default BackNavigation;
