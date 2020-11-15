const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Card = require("../models/Card");
const auth = require("../middleware/auth");
const Board = require("../models/Board");
const Column = require("../models/Column");
const mongoose = require("mongoose");

// @route   GET /api/cards?board=...&column=...
// @desc    Get all users cards
// @access  Private
router.get("/", auth, async (req, res) => {
  if (!req.query.board || !req.query.column) {
    return res
      .status(400)
      .json({ msg: "Cannot load data because wrong format URL" });
  }
  try {
    let boardId;
    try {
      boardId = mongoose.Types.ObjectId(req.query.board);
    } catch (err) {
      console.error(err.message);
      return res
        .status(400)
        .json({ msg: "Cannot load data because board id is not valid" });
    }
    const cards = await Card.find({
      board: boardId,
      column: req.query.column,
    });

    const orderedIds = await Column.findOne({ name: req.query.column });
    let orderedCards = [...Array(orderedIds.list.length)];

    const reorder = async () => {
      for (const card of cards) {
        const index = await orderedIds.list.findIndex(
          (id) => String(id) === String(card._id)
        );
        orderedCards[index] = card;
      }
    };

    await reorder();

    res.json(orderedCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST /api/cards
// @desc    Add new card
// @access  Private
router.post(
  "/",
  [
    auth,
    [
      check("content", "Content is required").not().isEmpty(),
      check(
        "column",
        "Column consists of wentWell, toImprove or actionItems"
      ).isIn(["wentWell", "toImprove", "actionItems"]),
      check("board", "BoardId is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { content, column, board } = req.body;
    try {
      try {
        const foundBoard = await Board.findOne({
          _id: mongoose.Types.ObjectId(board),
        });
        if (!foundBoard) {
          return res
            .status(400)
            .json({ msg: "Cannot add card because board id not found" });
        }
      } catch (err) {
        return res
          .status(400)
          .json({ msg: "Cannot add card because board id not found" });
      }

      const newCard = new Card({
        board,
        column,
        content,
        user: req.user.id,
      });
      const card = await newCard.save();

      // Init column
      try {
        const foundColumn = await Column.findOne({ name: column });
        if (!foundColumn) {
          const newColumn = new Column({
            name: column,
            list: [card._id],
          });
          const column = await newColumn.save();
        } else {
          await Column.findOneAndUpdate(
            { name: column },
            { $push: { list: { $each: [card._id], $position: 0 } } },
            { new: true }
          );
        }
      } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }

      res.json(card);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

// @route   PUT api/cards/:id
// @desc    Update card
// @access  Private
router.put("/:id", auth, async (req, res) => {
  const { content } = req.body;
  const updatedContent = {};
  if (content) updatedContent.content = content;

  try {
    let card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ msg: "Contact not found" });
    }
    card = await Card.findByIdAndUpdate(
      req.params.id,
      { $set: updatedContent },
      { new: true }
    );
    res.json(card);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/cards/:id
// @desc    Delete card
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    let cardId;
    try {
      cardId = mongoose.Types.ObjectId(req.params.id);
    } catch (err) {
      console.error(err.message);
      return res.status(400).json({ msg: "Bad request" });
    }

    let card = await Card.findById(cardId);

    if (!card) return res.status(404).json({ msg: "Card not found" });

    // if (card.user.toString() !== req.user.id) {
    //   return res.status(401).json({ msg: "Not authorized" });
    // }
    const cardToRemove = await Card.findById(cardId);
    const columnModified = await Column.findOne({ name: cardToRemove.column });
    const updatedList = columnModified.list.filter(
      (id) => String(id) !== String(cardToRemove._id)
    );
    const updatedColumn = await Column.findByIdAndUpdate(
      columnModified._id,
      { $set: { list: updatedList } },
      { new: true }
    );
    console.log("Done delete");
    console.log(updatedColumn);

    await Card.findByIdAndRemove(cardId);

    res.json({ msg: "Card removed" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/cards/:id?columnDes&indexDes
// @desc    Move card
// @access  Private
// router.get("/move/:id", auth, async (req, res) => {
//   if (!req.query.board || !req.query.column) {
//     return res
//       .status(400)
//       .json({ msg: "Cannot load data because wrong format URL" });
//   }
//   try {
//     let boardId;
//     try {
//       boardId = mongoose.Types.ObjectId(req.query.board);
//     } catch (err) {
//       console.error(err.message);
//       return res
//         .status(400)
//         .json({ msg: "Cannot load data because board id is not valid" });
//     }
//     const cards = await Card.find({
//       board: boardId,
//       column: req.query.column,
//     });
//     res.json(cards);
//   } catch (err) {
//     console.error(err.message);
//     res.status(500).send("Server Error");
//   }
// });

module.exports = router;
