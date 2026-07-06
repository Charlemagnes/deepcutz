import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

function Hello() {
  return <p>Hello, deepcutz</p>
}

describe('vitest + RTL smoke test', () => {
  it('renders', () => {
    render(<Hello />)
    expect(screen.getByText('Hello, deepcutz')).toBeInTheDocument()
  })
})
