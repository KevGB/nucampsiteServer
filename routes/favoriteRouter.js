const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("user")
      .populate("campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .then((favorite) => {
        if (favorite) {
          req.body.forEach((campsite) => {
            if (!favorite.campsites.includes(campsite._id)) {
              favorite.campsites.push(campsite._id);
            }
          });
          favorite
            .save()
            .then((updatedFavorite) => {
              res.setHeader("Content-Type", "application/json");
              res.status(200).json(updatedFavorite);
            })
            .catch((err) => next(err));
        } else {
          Favorite.create({
            user: req.user._id,
            campistes: req.body.map((campsite) => campsite._id),
          })
            .then((newFavorite) => {
              res.setHeader("Content-Type", "application/json");
              res.status(200).json(newFavorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {}
  );

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res, next) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {})
  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    (req, res, next) => {}
  );
module.exports = favoriteRouter;
