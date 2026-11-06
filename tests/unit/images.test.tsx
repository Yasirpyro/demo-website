import { fireEvent, render, screen } from '@testing-library/react';
import { it, expect } from 'vitest';
import { FoodImage } from '../../src/components/ui/FoodImage';
it('renders a branded fallback after an image fails and recovers when the dish changes', () => {
  const { rerender } = render(<FoodImage image="tikka" alt="Test tikka" />);
  fireEvent.error(screen.getByRole('img', { name: 'Test tikka' }));
  expect(screen.getByRole('img', { name: 'Test tikka' }).tagName).toBe('DIV');
  expect(screen.getByText('Test tikka')).toBeVisible();
  rerender(<FoodImage image="karahi" alt="Test karahi" />);
  expect(screen.getByRole('img', { name: 'Test karahi' }).tagName).toBe('IMG');
});
it('does not request unknown image URLs', () => {
  render(<FoodImage image="missing" alt="A dish" />);
  expect(screen.getByRole('img', { name: 'A dish' }).tagName).toBe('DIV');
  expect(document.querySelector('img')).toBeNull();
});
