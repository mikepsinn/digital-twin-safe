import VariablesList, { PINNED_VARIABLES_LIST_TEST_ID, ALL_VARIABLES_LIST_TEST_ID } from './VariablesList'
import { render, screen, fireEvent, within, act, waitFor } from 'src/utils/test-utils'
import * as userVariableUtils from 'src/routes/safe/components/Variables/utils'
import { loadFromStorage, saveToStorage } from 'src/utils/storage'
import * as clipboard from 'src/utils/clipboard'
import { getShareUserVariableUrl } from 'src/routes/routes'
import { CHAIN_ID } from 'src/config/chain.d'
import { CURRENT_SESSION_REDUCER_ID } from 'src/logic/currentSession/store/reducer/currentSession'

const mockStore = {
  [CURRENT_SESSION_REDUCER_ID]: {
    currentSafeAddress: '0xbc2BB26a6d821e69A38016f3858561a1D80d4182',
  },
}

beforeEach(() => {
  // Includes an id that doesn't exist in the remote userVariables to check that there's no error
  saveToStorage(userVariableUtils.PINNED_SAFE_VARIABLE_IDS, ['14', '24', '228'])
})

describe('Safe Variables -> VariablesList', () => {
  it('Shows userVariables from the Remote user variable list', async () => {
    render(<VariablesList />, mockStore)

    await waitFor(() => {
      expect(screen.getByText('Compound')).toBeInTheDocument()
      expect(screen.getByText('ENS UserVariable')).toBeInTheDocument()
    })
  })

  it('Shows userVariables from the Custom user variable list', async () => {
    render(<VariablesList />, mockStore)

    await waitFor(() => {
      expect(screen.getByText('Drain safe')).toBeInTheDocument()
    })
  })

  it('Shows different user variable sections', async () => {
    render(<VariablesList />, mockStore)

    await waitFor(() => {
      expect(screen.getByText('ALL APPS')).toBeInTheDocument()
      expect(screen.getByText('BOOKMARKED APPS')).toBeInTheDocument()
      expect(screen.getByText('CUSTOM APPS')).toBeInTheDocument()
    })
  })
})

describe('Safe Variables -> VariablesList -> Search', () => {
  it('Shows userVariables matching the search query', async () => {
    render(<VariablesList />, mockStore)

    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))

    fireEvent.input(searchInput, { target: { value: 'Compound' } })

    expect(screen.getByText('Compound')).toBeInTheDocument()
    expect(screen.queryByText('ENS UserVariable')).not.toBeInTheDocument()
  })

  it('Shows user variable matching the name first for a query that matches in name and description of multiple userVariables', async () => {
    render(<VariablesList />, mockStore)

    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))

    fireEvent.input(searchInput, { target: { value: 'Tra' } })

    // matches the name
    const transactionBuilder = screen.getByText('Transaction Builder')
    // matches the description (synthetix)
    const synthetix = screen.getByText('Trade synthetic assets on Ethereum')
    // query the dom for ordered array of matches
    const results = screen.queryAllByText(/Tra/)

    expect(results[0]).toBe(transactionBuilder)
    expect(results[1]).toBe(synthetix)
  })

  it('Shows "no userVariables found" message when not able to find userVariables matching the query and a button to search for the WalletConnect Safe userVariable', async () => {
    render(<VariablesList />, mockStore)

    const query = 'not-a-real-userVariable'
    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))

    fireEvent.input(searchInput, { target: { value: query } })

    expect(screen.getByText(/No userVariables found matching/)).toBeInTheDocument()

    const button = screen.getByText('Search WalletConnect')
    fireEvent.click(button)

    expect((searchInput as HTMLInputElement).value).toBe('WalletConnect')
  })

  it('Clears the search result when you press on clear button and shows all userVariables again', async () => {
    render(<VariablesList />, mockStore)

    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))
    fireEvent.input(searchInput, { target: { value: 'Compound' } })

    const clearButton = screen.getByLabelText('Clear the search')
    fireEvent.click(clearButton)

    expect((searchInput as HTMLInputElement).value).toBe('')
  })

  it("Doesn't display custom/pinned userVariables irrelevant to the search (= hides pinned/custom sections)", async () => {
    render(<VariablesList />, mockStore)

    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))

    fireEvent.input(searchInput, { target: { value: 'Compound' } })

    expect(screen.queryByText('Drain Safe')).not.toBeInTheDocument()
    expect(screen.queryByText('Transaction builder')).not.toBeInTheDocument()
  })

  it('Hides pinned/custom sections when you search', async () => {
    render(<VariablesList />, mockStore)

    const searchInput = await waitFor(() => screen.getByPlaceholderText('e.g. Compound'))

    fireEvent.input(searchInput, { target: { value: 'Compound' } })

    expect(screen.queryByText('PINNED APPS')).not.toBeInTheDocument()
    expect(screen.queryByText('CUSTOM APPS')).not.toBeInTheDocument()
  })
})

describe('Safe Variables -> VariablesList -> Pinning userVariables', () => {
  it('Shows a tutorial message when there are no pinned userVariables', async () => {
    saveToStorage(userVariableUtils.PINNED_SAFE_VARIABLE_IDS, [])

    render(<VariablesList />, mockStore)

    const tut = await waitFor(() =>
      screen.getByText(
        (content) =>
          content.startsWith('Simply hover over an user variable and click on the') &&
          content.endsWith('to bookmark the user variable here for convenient access'),
      ),
    )
    expect(tut).toBeInTheDocument()
  })

  it('allows to pin and unpin an userVariable', async () => {
    render(<VariablesList />, mockStore)

    // check the user variable is not pinned
    await waitFor(() => {
      expect(within(screen.getByTestId(PINNED_VARIABLES_LIST_TEST_ID)).queryByText('Compound')).not.toBeInTheDocument()
    })

    const allVariablesContainer = screen.getByTestId(ALL_VARIABLES_LIST_TEST_ID)
    const compoundVariablePinBtn = within(allVariablesContainer).getByLabelText('Pin Compound Safe UserVariable')
    act(() => {
      fireEvent.click(compoundVariablePinBtn)
    })

    await waitFor(() => {
      expect(within(screen.getByTestId(PINNED_VARIABLES_LIST_TEST_ID)).getByText('Compound')).toBeInTheDocument()
      expect(
        within(screen.getByTestId(PINNED_VARIABLES_LIST_TEST_ID)).getByLabelText('Unpin Compound Safe UserVariable'),
      ).toBeInTheDocument()
    })

    const compoundVariableUnpinBtn = within(screen.getByTestId(PINNED_VARIABLES_LIST_TEST_ID)).getByLabelText(
      'Unpin Compound Safe UserVariable',
    )
    act(() => {
      fireEvent.click(compoundVariableUnpinBtn)
    })

    await waitFor(() => {
      expect(within(screen.getByTestId(PINNED_VARIABLES_LIST_TEST_ID)).queryByText('Compound')).not.toBeInTheDocument()
    })
  })

  // see #2847 for more info
  it('Removes pinned Safe Variables from localStorage when they are not included in the remote list', async () => {
    const defaultPinnedVariablesInLocalStorage = loadFromStorage<string[]>(userVariableUtils.PINNED_SAFE_VARIABLE_IDS)
    expect(defaultPinnedVariablesInLocalStorage).toContain('14')
    expect(defaultPinnedVariablesInLocalStorage).toContain('24')
    expect(defaultPinnedVariablesInLocalStorage).toContain('228')

    render(<VariablesList />, mockStore)
    await waitFor(() => {
      expect(screen.getByText('ALL APPS')).toBeInTheDocument()
      expect(screen.getByText('BOOKMARKED APPS')).toBeInTheDocument()
      expect(screen.getByText('CUSTOM APPS')).toBeInTheDocument()
    })

    // after that the localStorage should be updated
    const updatedPinnedVariablesInLocalStorage = loadFromStorage<string[]>(userVariableUtils.PINNED_SAFE_VARIABLE_IDS)

    // '228' UserVariable id should be removed from pinnedVariables ['14', '24', '228'] because is not included in the remote list
    expect(updatedPinnedVariablesInLocalStorage).toContain('14')
    expect(updatedPinnedVariablesInLocalStorage).toContain('24')
    expect(updatedPinnedVariablesInLocalStorage).not.toContain('228')
  })
})

describe('Safe Variables -> VariablesList -> Share Safe Variables', () => {
  it('Shows Share Safe user variable button in the Safe UserVariable Card', async () => {
    render(<VariablesList />, mockStore)

    await waitFor(() => {
      const allVariablesContainer = screen.getByTestId(ALL_VARIABLES_LIST_TEST_ID)
      const compoundVariableShareBtn = within(allVariablesContainer).getByLabelText(
        'copy Compound Safe UserVariable share link to clipboard',
      )

      expect(compoundVariableShareBtn).toBeInTheDocument()
    })
  })

  it('Copies the Safe user variable URL to the clipboard and shows a snackbar', async () => {
    const copyToClipboardSpy = jest.spyOn(clipboard, 'copyToClipboard')

    copyToClipboardSpy.mockImplementation(() => jest.fn())

    render(<VariablesList />, mockStore)

    // snackbar is not present
    expect(screen.queryByText('Safe UserVariable URL copied to clipboard!')).not.toBeInTheDocument()

    await waitFor(() => {
      const allVariablesContainer = screen.getByTestId(ALL_VARIABLES_LIST_TEST_ID)
      const compoundVariableShareBtn = within(allVariablesContainer).getByLabelText(
        'copy Compound Safe UserVariable share link to clipboard',
      )

      // we click on the Share Safe UserVariable Button
      fireEvent.click(compoundVariableShareBtn)

      const compoundUrl = 'https://cloudflare-ipfs.com/ipfs/QmX31xCdhFDmJzoVG33Y6kJtJ5Ujw8r5EJJBrsp8Fbjm7k'
      const shareUserVariableUrl = getShareUserVariableUrl(compoundUrl, CHAIN_ID.RINKEBY)

      // share Safe user variable url is copied in the clipboard
      expect(copyToClipboardSpy).toHaveBeenCalledWith(shareUserVariableUrl)

      // we show a snackbar
      expect(screen.getByText('Safe UserVariable URL copied to clipboard!')).toBeInTheDocument()
    })
  })

  it('Calls onRemoveVariable when a custom user variable is removed', async () => {
    const onRemoveVariableMock = jest.fn()

    render(<VariablesList />, mockStore)

    const openConfirmationModalBtn = await screen.findByLabelText(/remove drain safe custom safe UserVariable/i)

    fireEvent.click(openConfirmationModalBtn)

    const removeBtn = await screen.findByTestId('confirm-btn')

    fireEvent.click(removeBtn)

    expect(onRemoveVariableMock).toHaveBeenCalledTimes(1)
  })
})
