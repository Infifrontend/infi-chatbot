import { Provider } from 'react-redux';
import { store } from './store/store.ts';
import ChatContainer from './components/ChatContainer/ChatContainer';
import React, { useEffect } from "react";

type AppProps = {
  data: any;
};
const App: React.FC<AppProps> = (packageData: any) => {

  console.log(packageData,'Web Pack Data');
  
  const userId = packageData?.data?.userId ?? "abc123";
  const token = packageData?.data?.token ?? "xyz-token-456";

  return (
    <Provider store={store}>
      <ChatContainer userId={userId} token={token} />
    </Provider>
  )
}
export default App;
