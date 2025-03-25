import {useAuth0} from '@auth0/auth0-react';

const LoginButton = ()=>{
    const {loginWithRedirect, isAuthenticated} = useAuth0();

    return(
        !isAuthenticated && (
            <div className="buttons-container">
            <button  className="button-arounder"onClick={()=> loginWithRedirect()}>
                Sign In
            </button>
            </div>
        )
    )
}

export default LoginButton