import React, { Fragment, useContext, useEffect } from "react";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Grid, Button } from "@material-ui/core";
import ArrowBack from "@material-ui/icons/ArrowBack";
import { DragDropContext } from "react-beautiful-dnd";

import CardColumn from "../cards/CardColumn";

// Contexts
import CardsContext from "../../context/cards/cardsContext";
import AuthContext from "../../context/auth/authContext";
import ConfirmDialogContext from "../../context/confirmDialog/confirmDialogContext";
import AlertContext from "../../context/alert/alertContext";
import ColumnsContext from "../../context/columns/columnsContext";

import { CONFIRM_DELETE_CARD } from "../notification/types";

const useStyles = makeStyles((theme) => ({
  container: {
    marginTop: "5px",
  },
  columnTitle: {
    marginTop: "0.2rem",
    padding: "1rem",
  },
  wentWell: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.text.primary,
  },
  toImprove: {
    backgroundColor: theme.palette.warning.main,
    color: theme.palette.text.primary,
  },
  actionItems: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.text.primary,
  },
}));

const Board = ({ match }) => {
  const classes = useStyles();

  const cardsContext = useContext(CardsContext);
  const authContext = useContext(AuthContext);
  const confirmDialogContext = useContext(ConfirmDialogContext);
  const alertContext = useContext(AlertContext);
  const columnsContext = useContext(ColumnsContext);

  const {
    wentWell,
    toImprove,
    actionItems,
    error,
    getCards,
    removeCard,
  } = cardsContext;
  const { loadUser } = authContext;
  const { hideConfirm, confirm } = confirmDialogContext;
  const { setAlert } = alertContext;

  const {
    wentWellOrder,
    toImproveOrder,
    actionItemsOrder,
    getColumnOrders,
    moveCard,
  } = columnsContext;

  useEffect(() => {
    getCards(match.params.id);
    // eslint-disable-next-line
  }, [wentWellOrder, toImproveOrder, actionItemsOrder]);

  // Initialize in the fisrt load
  useEffect(() => {
    loadUser();
    getCards(match.params.id);
    getColumnOrders(match.params.id);
    // Get board details
    // eslint-disable-next-line
  }, []);

  // Delete card listener
  useEffect(() => {
    if (
      confirm &&
      confirm.message.type === CONFIRM_DELETE_CARD &&
      confirm.result === true
    ) {
      removeCard(confirm.message.idCard);
      hideConfirm();
    }
    // eslint-disable-next-line
  }, [confirm]);

  // Listen error when loading cards
  useEffect(() => {
    if (error) setAlert(error);
    // eslint-disable-next-line
  }, [error]);

  const wentWellColumn = {
    title: "Went Well",
    type: "wentWell",
  };
  const toImproveColumn = {
    title: "To Improve",
    type: "toImprove",
  };
  const actionItemsColumn = {
    title: "Action Items",
    type: "actionItems",
  };

  const onDragEnd = async (result) => {
    await moveCard({
      boardId: match.params.id,
      destColumn: result.destination.droppableId,
      destIndex: result.destination.index,
      srcId: result.draggableId,
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Fragment>
        <Grid container className={classes.container}>
          <Grid item>
            <Link
              to="/boards"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Button variant="outlined" startIcon={<ArrowBack />}>
                Back to boards
              </Button>
            </Link>
          </Grid>
        </Grid>
        <Grid container spacing={1}>
          <CardColumn
            column={wentWellColumn}
            columnClasses={clsx(classes.columnTitle, classes.wentWell)}
            cards={wentWell}
            order={wentWellOrder}
            boardId={match.params.id}
          />
          <CardColumn
            column={toImproveColumn}
            columnClasses={clsx(classes.columnTitle, classes.toImprove)}
            cards={toImprove}
            order={toImproveOrder}
            boardId={match.params.id}
          />
          <CardColumn
            column={actionItemsColumn}
            columnClasses={clsx(classes.columnTitle, classes.actionItems)}
            cards={actionItems}
            order={actionItemsOrder}
            boardId={match.params.id}
          />
        </Grid>
      </Fragment>
    </DragDropContext>
  );
};

export default Board;
