import React, { useContext, useState, useEffect } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { Link as LinkRoute } from "react-router-dom";
import Grid from "@material-ui/core/Grid";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";

import AuthContext from "../../context/auth/authContext";
import AlertContext from "../../context/alert/alertContext";

import GoogleLogin from "react-google-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp(props) {
  const classes = useStyles();

  const alertContext = useContext(AlertContext);
  const authContext = useContext(AuthContext);

  const { setAlert } = alertContext;
  const {
    loginOAuth,
    register,
    error,
    clearErrors,
    isAuthenticated,
  } = authContext;

  useEffect(() => {
    if (isAuthenticated) {
      props.history.push("/");
    }

    if (error) {
      setAlert(error);
      clearErrors();
    }
    // eslint-disable-next-line
  }, [error, isAuthenticated, props.history]);

  const [user, setUser] = useState({
    name: "",
    username: "",
    password: "",
  });

  const { name, username, password } = user;

  const handleChange = (e) => {
    setUser({
      ...user,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    register({
      name,
      username,
      password,
    });
  };

  const responseGoogle = (response) => {
    console.log(response);
    const data = {
      name: response.profileObj.name,
      username: response.profileObj.email,
      photo: response.profileObj.imageUrl,
      provider: "Google",
      token: response.googleId,
    };
    loginOAuth(data);
  };

  const responseFacebook = (response) => {
    const data = {
      name: response.name,
      username: response.id,
      photo: response.picture.data.url,
      provider: "Facebook",
      token: response.id,
    };
    loginOAuth(data);
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign up
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                autoComplete="name"
                name="name"
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Full Name"
                autoFocus
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={handleSubmit}
          >
            Sign Up
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <LinkRoute
                style={{ color: "inherit" }}
                to="/sign-in"
                variant="body2"
              >
                Already have an account? Sign in
              </LinkRoute>
            </Grid>
          </Grid>
          {/* Login with Google */}
          <GoogleLogin
            clientId="1059772356052-qbun9dqircn3k2l7lkq9g2vi3mpqef80.apps.googleusercontent.com"
            buttonText="Login with Google"
            render={(renderProps) => (
              <Button
                fullWidth
                variant="outlined"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                color="secondary"
                style={{ marginTop: "0.5rem" }}
              >
                Login with Google
              </Button>
            )}
            onSuccess={responseGoogle}
            onFailure={responseGoogle}
            cookiePolicy={"single_host_origin"}
          />
          <FacebookLogin
            appId="391794955521742"
            autoLoad={false}
            fields="name,email,picture"
            callback={responseFacebook}
            buttonText="Login with Facebook"
            render={(renderProps) => (
              <Button
                fullWidth
                variant="outlined"
                onClick={renderProps.onClick}
                disabled={renderProps.disabled}
                color="primary"
                style={{ marginTop: "0.5rem" }}
              >
                Login with Facebook
              </Button>
            )}
          />
        </form>
      </div>
    </Container>
  );
}
