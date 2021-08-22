import { useState } from 'react'

import Account from 'src/models/Account'
import createAccount from 'lib/createAccount'

import getUpdatedAccount from './getUpdatedAccount'

const initialAccountValue = createAccount()

const useAccount = (): [Account, () => Promise<void>] => {
  const [account, setAccount] = useState<Account>(initialAccountValue)
  const refreshAccount = async () =>
    //Level 2: Handle errors
    //I expanded the 'Account' context to include an isDisconnected property, which is used to determine if an error message should be displayed to the user
    {
        try{
            let UpdateConnected = account;
            UpdateConnected.isDisconnected = false;
            setAccount(await getUpdatedAccount(UpdateConnected))
        }
        catch(err){
            let updateDisconnected = account;
            account.isDisconnected = true;
            setAccount(await getUpdatedAccount(updateDisconnected));
        }
    }
  return [account, refreshAccount]
}

export default useAccount
