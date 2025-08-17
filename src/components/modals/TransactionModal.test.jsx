import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TransactionModal from './TransactionModal';

describe('TransactionModal', () => {
  it('renders when categories prop is undefined', () => {
    const props = {
      isOpen: true,
      onClose: () => {},
      onSave: () => {},
      transactionToEdit: null,
      accounts: [],
      categories: undefined,
      onError: () => {},
      isCorrectionMode: false,
    };

    expect(() => render(<TransactionModal {...props} />)).not.toThrow();
  });
});

