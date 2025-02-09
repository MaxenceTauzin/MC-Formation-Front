import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import React, { useEffect, useState } from "react";
import { AiOutlineRollback } from "react-icons/ai";
import { Link, useNavigate, useParams } from "react-router-dom";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import {
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import toast from "react-hot-toast";
import { PostCheckToken, PostNewMdp } from "../../../serverInteraction/PostResetMdp";
import { hashPassword } from "../../../utils/PasswordUtils";

interface State {
  password: string;
  passwordConfirmation: string;
  showPassword: boolean;
}

const MotDePasseOublie = () => {
  const [values, setValues] = React.useState<State>({
    password: "",
    passwordConfirmation: "",
    showPassword: false,
  });

  const navigate = useNavigate();

  const [showFormulaire, setShowFormulaire] = useState(null);

  const {token} = useParams();

  useEffect(() => {
    checktoken();
  }, [])

  const checktoken = async () => {
    try {
        const response = await PostCheckToken( token );
        setShowFormulaire(response?.data?.message);
    } catch (err) {
        toast.error(err.response.data?.message);
        navigate("/");
    }
}

  const handleClickShowPassword = () => {
    setValues({
      ...values,
      showPassword: !values.showPassword,
    });
  };

  const handleChange =
    (prop: keyof State) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues({ ...values, [prop]: event.target.value });
    };

  const handleSubmit = async () => {
    try {
      const response = await PostNewMdp(hashPassword(values.password), token);
      toast.success(response.data.message);
      navigate("/")
    } catch (err) {
      toast.error(err.response.data.message);
    }
  };

  const validate = (e) => {
    e.preventDefault();
    if (values.password != values.passwordConfirmation) {
      toast.error("Les mots de passe sont différents");
    } else if (
      values.password.length == 0 ||
      values.passwordConfirmation.length == 0
    ) {
      toast.error("Les mots de passe ne doivent pas être vides");
    } else {
      handleSubmit();
    }
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Link to="/connexion" id="linkAccueil">
            <Button
              startIcon={<AiOutlineRollback className="Icones me-2" />}
              color="primary"
              sx={{ ml: 2 }}
            >
              Retour{" "}
            </Button>
          </Link>
        </Grid>

        <Container component="main" maxWidth="md">
          <CssBaseline />
          <Box
            sx={{
              marginTop: 8,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: 2,
              paddingLeft: 10,
              paddingRight: 10,
              paddingTop: 3,
              paddingBottom: 3,
              borderRadius: 2,
            }}
          >
            <Typography component="h1" variant="h5">
              Réinitialisez votre mot de passe
            </Typography>

            <FormControl
              variant="outlined"
              sx={{ padding: 2, marginTop: 4, width: "75%" }}
            >
              <InputLabel htmlFor="passwordConfirmation">
                Choisissez votre mot de passe
              </InputLabel>
              <Input
                required
                fullWidth
                autoFocus
                name="password"
                type={values.showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password-confirmation"
                value={values.password}
                onChange={handleChange("password")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="password"
                      onClick={handleClickShowPassword}
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <FormControl variant="outlined" sx={{ padding: 2, width: "75%" }}>
              <InputLabel htmlFor="passwordConfirmation">
                Confirmez votre mot de passe
              </InputLabel>
              <Input
                required
                fullWidth
                autoFocus
                name="passwordConfirmation"
                type={values.showPassword ? "text" : "password"}
                id="passwordConfirmation"
                autoComplete="current-password-confirmation"
                value={values.passwordConfirmation}
                onChange={handleChange("passwordConfirmation")}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="passwordConfirmation"
                      onClick={handleClickShowPassword}
                    >
                      {values.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, maxWidth: "50%" }}
              onClick={validate}
            >
              Confirmer la modification
            </Button>
          </Box>
        </Container>
      </Grid>
    </>
  );
};

export default MotDePasseOublie;
