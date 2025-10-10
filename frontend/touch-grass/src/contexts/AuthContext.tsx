import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType } from '@/common/types/contexts';
import { FirebaseProviderData, FirebaseUser } from '@/common/types/auth';
import { CreateUserDto } from '@/common/dto/users/CreateUserDto';
import { SignupStage } from '@/common/types/new-user-workflow';
import { AuthService } from '@/services/auth';
import Gate from '@/components/Gate';

const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  firebaseProviderData: null,
  setAuthenticationInProgress: (_) => {},
});

export const AuthProvider = ({ children }: { children?: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firebaseProviderData, setFirebaseProviderData] = useState<FirebaseProviderData | null>(null);
  const [authenticationInProgress, setAuthenticationInProgress] = useState<boolean>(true);

  const handleAuthStateChanged = async (firebaseUser: FirebaseUser | null) => {
    setFirebaseUser(firebaseUser);

    if (firebaseUser) {
      // obtain the provider data from the firebase user
      const idToken = await firebaseUser?.getIdTokenResult();
      const signInProvider = idToken.signInProvider;
      const allProviderData = firebaseUser?.providerData;

      for (const provider of allProviderData) {
        if (provider.providerId === signInProvider) {
          console.log(`Provider Data being used:\n${JSON.stringify(provider)}`);
          setFirebaseProviderData(provider);
        }
      }
    } 
    else {
      setFirebaseProviderData(null);
    }

    setAuthenticationInProgress(false);
  };

  useEffect(() => {
    (async () => {
      return await AuthService.onAuthStateChanged(handleAuthStateChanged);
    })();
  }, []);

  // // STEP 1: New user profile details
  // if (newUserPayload && stage === 'new-user') {
  //   console.log('Step 1 in AuthContext');
  //   return (
  //     <NewUserScreen
  //       payload={newUserPayload}
  //       onContinue={async (updatedPayload: CreateUserDto) => {
  //         try {
  //           await createUser(updatedPayload);

  //           // After creating the user, confirm status from dashboard
  //           const dash = await getDashboard();
  //           const dto = dash?.data;
  //           const isDone = Boolean(dto?.completed_new_user_flow);

  //           setCompletedFlow(isDone);
  //           setStage(isDone ? 'idle' : 'validate-pic');
  //         } catch (err) {
  //           console.error('Failed to create user in backend:', err);
  //         }
  //       }}
  //     />
  //   );
  // }

  // // STEP 2: Validate profile picture ONLY if not completed
  // // context/AuthProvider.tsx  (STEP 2 render)
  // if (stage === 'validate-pic' && !completedFlow && firebaseUser) {
  //   console.log('Step 2 in AuthContext');
  //   return (
  //     <ValidateProfilePicScreen
  //       uid={firebaseUser.uid}
  //       title="Add a profile photo (optional)"
  //       onSkip={async () => {
  //         // optimistically move to the main app
  //         setCompletedFlow(true);
  //         setStage('idle');

  //         // (optional) verify with backend but don't block UI
  //         try {
  //           const dash = await getDashboard();
  //           const ok = Boolean(dash?.data?.completed_new_user_flow);
  //           if (!ok) {
  //             setCompletedFlow(false);
  //             setStage('validate-pic');
  //           }
  //         } catch {/* ignore */}
  //       }}
  //     />
  //   );
  // }

  return (
    <AuthContext.Provider 
      value={{ 
        firebaseUser: firebaseUser,
        firebaseProviderData: firebaseProviderData,
        setAuthenticationInProgress: setAuthenticationInProgress,
      }}
    >
      <Gate authenticationInProgress={authenticationInProgress}>
        {children}
      </Gate>
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => useContext(AuthContext);
