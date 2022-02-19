const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(detail => detail.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

router.get('/', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
    // キャンプ場一覧
}));

router.get('/new', catchAsync(async (req, res) => {
    res.render('campgrounds/new');
}));

router.get('/:id', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした!!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
    // キャンプ場詳細
}));

router.post('/', validateCampground, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success', '新しいキャンプ場を登録しました!!!');
    res.redirect(`/campgrounds/${campground._id}`);
    // キャンプ場の新規登録
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
        req.flash('error', 'キャンプ場は見つかりませんでした!!!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
    // キャンプ場の編集
}));

router.put('/:id',validateCampground, catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success', 'キャンプ場を更新しました!!!');
    res.redirect(`/campgrounds/${campground._id}`);
    // キャンプ場の更新
}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'キャンプ場を削除しました!!!');
    res.redirect('/campgrounds');
    // キャンプ場の削除
}));

module.exports = router;