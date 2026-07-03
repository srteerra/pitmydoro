import { Box, Text } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'use-intl';

interface Props {
  text: string;
  lineClamp?: number;
}

export const ExpandableText = ({ text, lineClamp = 2 }: Props) => {
  const statsT = useTranslations('stats');
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflows(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <Box>
      <Text
        ref={ref}
        opacity={0.7}
        wordBreak='break-word'
        lineClamp={expanded ? undefined : lineClamp}
      >
        {text}
      </Text>
      {(overflows || expanded) && (
        <Text
          as='button'
          mt={1}
          fontSize='xs'
          fontWeight='medium'
          color='gray'
          textDecoration='underline'
          cursor='pointer'
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? statsT('seeLess') : statsT('seeMore')}
        </Text>
      )}
    </Box>
  );
};
