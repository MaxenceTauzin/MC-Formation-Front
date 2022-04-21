import './Connexion.css';
import React, {useEffect, useRef, useState} from 'react';
import Utilisateur from "../../../api/model/Utilisateur";
import axios from '../../../api/axios';
import useAuth from '../../../auth/hooks/useAuth';
import {useLocation, useNavigate, useOutletContext} from 'react-router-dom';
import {hashPassword} from "../../../utils/PasswordUtils";

const LOGIN_URL = '/auth/signin';

const Connexion = () => {

    const {setAuth} = useAuth();
    const [login, setLogin] = useOutletContext();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";

    const userRef = useRef();
    const errRef = useRef();

    const [nomUtilisateur, setNomUtilisateur] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    //const [token, setToken] = useCookies(['token']);

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [nomUtilisateur, pwd])

    const mapFormToUtilisateur = () => {
        let utilisateur = new Utilisateur();
        utilisateur.nomUtilisateur = nomUtilisateur;
        utilisateur.password = hashPassword(pwd);
        return utilisateur;
    }

    const handleSubmit = async (e) => {

        e.preventDefault();
        const utilisateur = mapFormToUtilisateur();
        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify(utilisateur),
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: false,
                }
            );
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            localStorage.setItem("accessToken", accessToken);
            setAuth({nomUtilisateur, roles, accessToken});
            setNomUtilisateur('');
            setPwd('');
            setLogin(true)
            navigate(from, {replace: true});
        } catch (err) {
            if (!err?.response) {
                setErrMsg('no server response');
            } else if (err.response?.status === 400) {
                setErrMsg('missing nom utilisateur ou mot de passe');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login failed.');
            }
            errRef.current.focus();
        }
    }

    return (
        <>
            <div className="div-Connexion">
                <img src={require("../../../assets/img/logoblue_bgwht.png")} id="logo_connexion" alt="logo-mc"/>
                <h1 id="titreConnexion">Connectez-vous à l'espace <br/> Formation de MIAGE Connection</h1>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <form id="Form-Connexion" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <input
                            id="nomUtilisateur"
                            type="text"
                            ref={userRef}
                            className="form-control"
                            placeholder="Nom d'utilisateur"
                            onChange={(e) => setNomUtilisateur(e.target.value)}
                            name="nomUtilisateur"/>

                    </div>
                    <div className="form-group mt-3 mb-3">
                        <input
                            id="mdp"
                            type="password"
                            className="form-control"
                            placeholder="Mot de passe"
                            onChange={(e) => setPwd(e.target.value)}
                            name="mdp"
                        />
                    </div>
                    <input type="submit" className="form-group btn btn-mc" value="Se Connecter"
                           alt="buttonConnexion"/>
                </form>
                <div id="contactVP">
                    <a href="/">Entrer en contact avec VP Formation</a>
                </div>
            </div>
        </>
    );
}

export default Connexion;
