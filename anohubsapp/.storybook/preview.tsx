import React from 'react';
import { within, userEvent } from '@storybook/testing-library';
import '../src/index.css';

export const parameters = {
  actions: { argTypesRegex: '^on.*' },
};

export const decorators = [Story => <div style={{ padding: 20, background: '#0f172a' }}><Story /></div>];
