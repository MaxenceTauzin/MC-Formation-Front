import React, {useState} from 'react';
import Association from "../../../api/model/Association";
import {hashPassword} from "../../../utils/PasswordUtils";
import axios from "../../../api/axios";
import toast from "react-hot-toast";
import SignupRequest from "../../../api/model/SignupRequest";
import {useNavigate, useParams} from 'react-router-dom';


const FormulaireInscriptionAsso = () => {
    const [nomUtilisateur, setNomUtilisateur] = useState('');
    const [acronyme, setAcronyme] = useState('');
    const [nomComplet, setNomComplet] = useState('');
    const [ville, setVille] = useState('');
    const [college, setCollege] = useState('');
    const [mdp1, setMdp1] = useState('');
    const [mdp2, setMdp2] = useState('');
    const [mdp, setMdp] = useState('');
    const [hasUnfilled, setHasUnfilled] = useState({});
    const [options, setOptions] = useState([]);
    const [hasErrorAPI, setHasErrorAPI] = useState(false);
    const [loading, setLoading] = useState(false);

    const INSCRIPTION_URL = '/auth/signup/create?token='
    const {token} = useParams();
    const navigate = useNavigate();

    const handleSubmit = async () => {
        let association = mapFormToAssociation();
        try {
            const response = await axios.post(INSCRIPTION_URL + token,
                JSON.stringify(association),
                {
                    headers: {'Content-Type': 'application/json'}
                }
            );
            toast.success(response.data.message);
            navigate('/')
        } catch (err) {
            toast.error(err.response.data.message);
        }
    }

    //(le token retourne rôle + mail)
    const mapFormToAssociation = () => {
        let association = new Association()
        let signup = new SignupRequest()
        signup.nomUtilisateur = nomUtilisateur;
        signup.password = hashPassword(mdp);
        association.acronyme = acronyme;
        association.college = college;
        association.nomComplet = nomComplet;
        association.ville = ville;
        signup.association = association;
        return signup;
    }


    const resetForm = () => {
        setNomUtilisateur('');
        setAcronyme('');
        setNomComplet('');
        setHasUnfilled({});
        setVille('');
        setCollege([]);
        setMdp1('');
        setMdp2('');
    }

    const validate = () => {

        let hasUnfilled = {};
        let isValid = true;

        if (!nomUtilisateur) {
            isValid = false;
            hasUnfilled["nomUtilisateur"] = "Renseigner un nom d'utilisateur.";
        }
        if (!acronyme) {
            isValid = false;
            hasUnfilled["acronyme"] = "Renseigner l'acronyme.";
        }
        if (!nomComplet) {
            isValid = false;
            hasUnfilled["nomComplet"] = "Renseigner le nom complet.";
        }
        if (!ville) {
            isValid = false;
            hasUnfilled["ville"] = "Renseigner la ville.";
        }
        if (!college) {
            isValid = false;
            hasUnfilled["college"] = "Renseigner le collège.";
        }
        if (!mdp1) {
            isValid = false;
            hasUnfilled["mdp1"] = "Renseigner un mot de passe.";
        }
        if (mdp1 !== mdp2)
            isValid = false;
        hasUnfilled["mdp2"] = "Les mots de passe ne correspondent pas.";
        if (isValid) {
            handleSubmit();
        } else {
            setHasUnfilled(hasUnfilled);
        }
    }

    const clic = () => {
        if (mdp1 !== mdp2) {
            validate();
        } else if (mdp1 == "" && mdp2 == "") {
            validate();
        } else {
            validate();
        }

    }
    return (
        loading ? <div>Loading...</div> : hasErrorAPI ? <div>Error occured while fetching data.</div> :
            <div className="FormulaireInscription">
                <div className="row justify-content-md-center  mt-3">
                    <div className="col col-lg-5 border border-dark">
                        <h1 className="justify-content-center align-items-center">
                            <u>INSCRIPTION A LA PLATEFORME</u>
                        </h1>
                    </div>
                </div>
                <div className="row justify-content-md-center mt-3">
                    <div className="col col-lg-5 ">
                        <form>
                            <div className="form-group">
                                <label htmlFor="nomUtilisateur" className="mt-2 mb-2">Choisissez un nom
                                    d'utilisateur</label>
                                <input
                                    type="text"
                                    name="nomUtilisateur"
                                    value={nomUtilisateur}
                                    onChange={event => setNomUtilisateur(event.target.value)}
                                    className="form-control mt-2"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.nomUtilisateur}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="acronyme" className="mt-2 mb-2">Indiquez l'acronyme de votre
                                    association</label>
                                <input
                                    type="text"
                                    name="acronyme"
                                    value={acronyme}
                                    onChange={event => setAcronyme(event.target.value)}
                                    className="form-control mt-2"
                                    placeholder="Ex : JMC"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.acronyme}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="nomComplet" className="mt-2">Indiquez le nom complet de votre
                                    association</label>
                                <input
                                    type="text"
                                    name="nomComplet"
                                    value={nomComplet}
                                    onChange={event => setNomComplet(event.target.value)}
                                    className="form-control mt-2"
                                    placeholder="Ex : Junior MIAGE Concept Bordeaux"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.nomComplet}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="college" className="mt-2">Indiquez le college dont dépend votre
                                    association</label>
                                <select class="form-select" aria-label="Default select example"
                                        onChange={(e) => setCollege(e.target.value)}>
                                    <option value="" disabled selected hidden>Sélectionnez le collège de votre
                                        association
                                    </option>
                                    <option value="A">Collège A</option>
                                    <option value="B">Collège B</option>
                                    <option value="C">Collège C</option>
                                    <option value="D">Collège D</option>
                                </select>
                                <div className="text-danger">{hasUnfilled.college}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="ville" className="mt-2">Indiquez la ville de votre association</label>
                                <input
                                    type="text"
                                    name="ville"
                                    value={ville}
                                    onChange={event => setVille(event.target.value)}
                                    className="form-control mt-2"
                                    placeholder="Ex : Bordeaux"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.ville}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="mdp1" className="mt-2">Choisissez un mot de passe</label>
                                <input
                                    type="password"
                                    name="mdp1"
                                    value={mdp1}
                                    onChange={event => {
                                        setMdp(event.target.value);
                                        setMdp1(event.target.value)
                                    }}
                                    className="form-control mt-2"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.mdp1}</div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="mdp2" className="mt-2">Confirmez le mot de passe</label>
                                <input
                                    type="password"
                                    name="mdp2"
                                    value={mdp2}
                                    onChange={event => setMdp2(event.target.value)}
                                    className="form-control mt-2"
                                    id="email"/>
                                <div className="text-danger">{hasUnfilled.mdp2}</div>
                            </div>
                            <div className="d-flex justify-content-center">
                                <div className="p-2">
                                    <input type="button" value="Valider" className="btn btn-primary" onClick={clic}/>
                                </div>
                                <div className="p-2">
                                    <input type="button" value="Reset" className="btn btn-primary" onClick={resetForm}/>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
    );
}


export default FormulaireInscriptionAsso;
