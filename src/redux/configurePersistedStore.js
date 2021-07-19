import { createStore, applyMiddleware, compose } from "redux";
import rootReducer from "./reducers";
import reduxImmutableStateInvariant from "redux-immutable-state-invariant";
import thunk from "redux-thunk";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage';

const persistConfig = {
  key: 'root',
  storage,
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const configurePersistedStore = initialState => {
  let store;
  switch (process.env.NODE_ENV) {
    case "production": {
      store = createStore(persistedReducer, initialState, applyMiddleware(thunk));
      break;
    }
    default: {
      const composeEnhancers =
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

      store = createStore(
        persistedReducer,
        initialState,
        composeEnhancers(applyMiddleware(thunk, reduxImmutableStateInvariant()))
      );
      break;
    }
  }

  const persistor = persistStore(store);
  return { store, persistor }
}

export default configurePersistedStore;
