import React, { useState, useEffect } from 'react';
import { hpe } from 'grommet-theme-hpe';
import { Grommet, grommet, Box, Text } from '../src/js';
import isChromatic from 'chromatic/isChromatic';

const CUSTOM_THEMED = 'Custom Themed';
const THEMES = {
  hpe,
  grommet,
  base: {},
};

export const decorators = [
  (Story, context) => {
    const [state, setState] = useState('grommet');
    useEffect(() => {
      setState(context.globals.theme);
    }, [context.globals.theme]);

    /**
     * This demonstrates that custom themed stories are driven off the "base"
     * theme. Custom themed stories will live under a "CustomThemed" directory.
     */
    if (context.kind.split('/')[2] === CUSTOM_THEMED && state !== 'base') {
      // if we are running the story in chromatic we want the chromatic snapshot
      // to be taken in the base theme for custom theme stories
      if (isChromatic()) {
        return (
          <Grommet theme={THEMES.base}>
            <Story state={THEMES.base} />
          </Grommet>
        );
      }
      return (
        <Box align="center" pad="large">
          <Text size="large">
            {`Custom themed stories are only displayed in the
                "base" theme mode. To enable, select "base" from the
                Theme menu above.`}
          </Text>
        </Box>
      );
    }

    return (
      <Grommet theme={THEMES[state]}>
        <Story state={THEMES[state]} />
      </Grommet>
    );
  },
];

export const parameters = {
  layout: 'fullscreen',
  options: {
    storySort: (first, second) => {
      /**
       * The story sort algorithm will only ever compare two stories
       * a single time. This means that every story will only ever be either
       * the "first" parameter OR the "second" parameter, but not both.
       * So, the checks for custom themed stories need to happen on both inputs
       * of this function.
       *
       * A return value of 1 results in sorting the "first" story AFTER the
       * "second" story.
       *
       * A return value of 0 results in sorting the "first" story BEFORE the
       * secondary story.
       */
      const isFirstCustom = first[1].kind.split('/')[2] === CUSTOM_THEMED;
      const isSecondCustom = second[1].kind.split('/')[2] === CUSTOM_THEMED;
      if (isFirstCustom) return 1;
      if (isSecondCustom) return 0;
      return first[1].kind === second[1].kind
        ? 0
        : first[1].id.localeCompare(second[1].id, undefined, { numeric: true });
    },
  },
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    defaultValue: 'grommet',
    toolbar: {
      items: ['base', 'grommet', 'hpe'],
      showName: true,
    },
  },
};
