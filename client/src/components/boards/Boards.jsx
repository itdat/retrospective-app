import React, { Fragment, useState, useEffect, useContext } from "react";
import { Link as LinkRoute, Switch, Route } from "react-router-dom";

import {
  Card,
  Grid,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import Add from "@material-ui/icons/Add";
import Board from "./Board";
import FormInputDialog from "./FormInputDialog";

import AuthContext from "../../context/auth/authContext";
import BoardsContext from "../../context/boards/boardsContext";
import AlertContext from "../../context/alert/alertContext";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "5px",
  },
}));

const Boards = ({ match }) => {
  // Using styles
  const classes = useStyles();

  // Using contexts
  const authContext = useContext(AuthContext);
  const { loadUser } = authContext;

  const boardsContext = useContext(BoardsContext);
  const { boards, message, getBoards, addBoard } = boardsContext;

  const alertContext = useContext(AlertContext);
  const { setAlert } = alertContext;

  // Handle form dialog
  const [open, setOpen] = useState(false);
  const closeDialog = () => setOpen(false);

  const showDialog = () => {
    setOpen(true);
  };

  // Load data when component did mount
  useEffect(() => {
    loadUser();
    getBoards();
    // eslint-disable-next-line
  }, []);

  // Listen if error occurs
  useEffect(() => {
    if (message) {
      setAlert(message);
    }
    // eslint-disable-next-line
  }, [message]);

  return (
    <Switch>
      <Route path={`${match.path}/:id`} component={Board} />
      <Route
        exact
        path={match.path}
        render={() => (
          <Fragment>
            <Grid container className={classes.container} spacing={1}>
              <Grid item xs={12}>
                {/* Show form input dialog */}
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<Add />}
                  onClick={showDialog}
                >
                  Add new board
                </Button>
              </Grid>

              {/* List of created boards */}
              {boards &&
                boards.map((board) => (
                  <Grid item key={board._id} xs={12} sm={3}>
                    <Card className={classes.root}>
                      <LinkRoute
                        to={`/boards/${board._id}`}
                        style={{ color: "inherit", textDecoration: "none" }}
                      >
                        <CardActionArea>
                          <CardMedia
                            component="img"
                            alt="Contemplative Reptile"
                            height="140"
                            image="https://picsum.photos/300"
                            title="Contemplative Reptile"
                          />
                          <CardContent>
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="h2"
                            >
                              {board.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              color="textSecondary"
                              component="p"
                            >
                              {board.context}
                            </Typography>
                          </CardContent>
                        </CardActionArea>
                      </LinkRoute>
                      <CardActions>
                        <Button size="small" color="primary">
                          Share
                        </Button>
                        <Button size="small" color="primary">
                          Edit
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
            </Grid>
            <FormInputDialog
              isOpen={open}
              closeDialog={closeDialog}
              addBoard={addBoard}
            />
          </Fragment>
        )}
      />
    </Switch>
  );
};

export default Boards;
