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
    Favorite.find({ user: req.user._id })
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
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete(req.user._id).then((favorite) => {
      res.statusCode = 200;
      if (req.user._id) {
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(favorite);
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.status(200).end("You do not have any favorites to delete");
      }
    });
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res, next) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/:campsiteId");
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne(req.user._id).then((favorite) => {
      if (favorite) {
        if (Favorite.campsites.includes(favorite)) {
          res
            .status(200)
            .send("That campsite is already in your favorites list");
        } else {
          Favorite.campsites.push(favorite);
          Favorite.save()
            .then((updatedFavorite) => {
              res.setHeader("Content-Type", "application/json");
              res.status(200).json(updatedFavorite);
            })
            .catch((err) => next(err));
        }
      } else {
        Favorite.create({
          user: req.user._id,
          campsites: req.body,
        })
          .then((newFavorite) => {
            res.setHeader("Content-Type", "application/json");
            res.status(200).json(newFavorite);
          })
          .catch((err) => next(err));
      }
    });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/:campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne(req.user._id).then(() => {
      if (favorite) {
        const newFavorite = Favorite.campsites
          .filter((campsite) => campsite._id !== favorite._id)
          .save();
        res.setHeader("Content-Type", "application/json");
        res.status(200).json(newFavorite);
      } else {
        res.setHeader("Content-Type", "text/plain");
        res.status(200).end("You do not have any favorites to delete");
      }
    });
  });
module.exports = favoriteRouter;
