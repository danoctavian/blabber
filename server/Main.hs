{-# LANGUAGE ForeignFunctionInterface #-} 
{-# LANGUAGE OverloadedStrings #-}

import Web.Scotty
import Database.MongoDB

import Network.Wai.Middleware.RequestLogger -- install wai-extra if you don't have this

import Control.Monad.Trans
import Data.Monoid
import System.Random (newStdGen, randomRs)

import Network.HTTP.Types (status302)
import Network.Wai
import qualified Data.Text.Lazy as T

import Data.Text.Lazy.Encoding (decodeUtf8)


dbName = "blabberDB"
collName = "logs"

storeLogs logs dbName collName = do
  pipe <- liftIO $ runIOE $ connect (host "127.0.0.1")
  e <- access pipe master dbName (storeInColl logs collName)
  return ()

storeInColl logs collName = do
  insert collName  ["logs" := logs]
  return ()

main = scotty 80 $ do
  middleware logStdoutDev
  post "/uploadLogs" $ do
    b <- body
    liftIO $ putStrLn $ show b
    storeLogs (String . T.toStrict . decodeUtf8  $ b) dbName collName
    text "matah"
