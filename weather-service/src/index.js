"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var axios_1 = require("axios");
var ioredis_1 = require("ioredis");
var path_1 = require("path");
var app = (0, express_1.default)();
var PORT = 3000;
var redis = new ioredis_1.default();
app.use(express_1.default.static(path_1.default.join(__dirname, "..", "public")));
var WEATHER_TTL = 15 * 60; // 15 минут
// Получить координаты по названию города
function getCityCoords(city) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    url = "https://geocoding-api.open-meteo.com/v1/search?name=".concat(encodeURIComponent(city));
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _c.sent();
                    if ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.results) === null || _b === void 0 ? void 0 : _b.length) {
                        return [2 /*return*/, {
                                lat: response.data.results[0].latitude,
                                lon: response.data.results[0].longitude,
                                name: response.data.results[0].name,
                                country: response.data.results[0].country,
                            }];
                    }
                    throw new Error("City not found");
            }
        });
    });
}
// Получить прогноз погоды по координатам
function getWeather(lat, lon) {
    return __awaiter(this, void 0, void 0, function () {
        var url, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    url = "https://api.open-meteo.com/v1/forecast?latitude=".concat(lat, "&longitude=").concat(lon, "&hourly=temperature_2m");
                    return [4 /*yield*/, axios_1.default.get(url)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
            }
        });
    });
}
app.get("/weather", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var city, cacheKey, cached, coords, weather, result, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                city = req.query.city;
                if (!city)
                    return [2 /*return*/, res.status(400).json({ error: "city required" })];
                cacheKey = "weather:".concat(city.toLowerCase());
                return [4 /*yield*/, redis.get(cacheKey)];
            case 1:
                cached = _a.sent();
                if (cached) {
                    return [2 /*return*/, res.json(JSON.parse(cached))];
                }
                _a.label = 2;
            case 2:
                _a.trys.push([2, 6, , 7]);
                return [4 /*yield*/, getCityCoords(city)];
            case 3:
                coords = _a.sent();
                return [4 /*yield*/, getWeather(coords.lat, coords.lon)];
            case 4:
                weather = _a.sent();
                result = {
                    city: coords.name,
                    country: coords.country,
                    hourly: weather.hourly,
                };
                // 5. Кэшируем!
                return [4 /*yield*/, redis.setex(cacheKey, WEATHER_TTL, JSON.stringify(result))];
            case 5:
                // 5. Кэшируем!
                _a.sent();
                res.json(result);
                return [3 /*break*/, 7];
            case 6:
                err_1 = _a.sent();
                res.status(500).json({ error: (err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || "unknown error" });
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
app.listen(PORT, function () {
    console.log("Weather server started at http://localhost:".concat(PORT));
});
