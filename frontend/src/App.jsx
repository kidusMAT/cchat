import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  ArrowLeft,
  ThumbsUp,
  Skull,
  Heart,
  Laugh,
  Paperclip,
  Plus,
  Image,
  Music,
  Eye,
  EyeOff,
  Users,
  MessageCircle,
  ChevronUp,
  ChevronDown,
  Radio,
  Flame,
  User,
  Lock,
  Mail,
  X,
  Target,
  Camera,
  Video,
  LogOut,
  Settings,
  Bell,
  Wifi,
  Clock
} from 'lucide-react';
import axios from 'axios';

// Configure axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
axios.defaults.baseURL = API_URL;

const EMOJI_DATA = [
  { char: '✨', tags: 'sparkles vibe shine magic' }, { char: '🔥', tags: 'fire hot flame vibe' }, { char: '🌈', tags: 'rainbow vibe color' }, { char: '🌪️', tags: 'tornado vibe storm' }, { char: '🌊', tags: 'wave vibe water' },
  { char: '⚡', tags: 'bolt light tech' }, { char: '🌌', tags: 'galaxy space vibe' }, { char: '🌠', tags: 'star wish' }, { char: '🌑', tags: 'moon dark' }, { char: '🌕', tags: 'moon light' },
  { char: '🪐', tags: 'planet space' }, { char: '🌀', tags: 'vortex spiral' }, { char: '🎭', tags: 'mask drama vibe' }, { char: '🔮', tags: 'crystal ball magic' }, { char: '🧿', tags: 'eye protect' },
  { char: '🚀', tags: 'rocket motion space' }, { char: '🛸', tags: 'ufo alien motion' }, { char: '🛰️', tags: 'satellite tech motion' }, { char: '🚁', tags: 'heli motion' }, { char: '🛴', tags: 'scoot motion' },
  { char: '🛹', tags: 'skate motion' }, { char: '👟', tags: 'shoe motion' }, { char: '💨', tags: 'dash motion' }, { char: '🤸', tags: 'flip motion' }, { char: '🏄', tags: 'surf motion' },
  { char: '🏌️', tags: 'golf motion' }, { char: '🤾', tags: 'ball motion' }, { char: '🏇', tags: 'horse motion' }, { char: '🤺', tags: 'sword motion' }, { char: '🏹', tags: 'archery motion' },
  { char: '💾', tags: 'disk tech save' }, { char: '🖱️', tags: 'mouse tech' }, { char: '⌨️', tags: 'keys tech type' }, { char: '🖥️', tags: 'pc tech' }, { char: '🎬', tags: 'movie tech' },
  { char: '📷', tags: 'cam tech' }, { char: '📼', tags: 'vhs tech' }, { char: '📻', tags: 'radio tech' }, { char: '🕯️', tags: 'candle light' }, { char: '🔦', tags: 'torch light' },
  { char: '🔋', tags: 'battery tech' }, { char: '🔌', tags: 'plug tech' }, { char: '📡', tags: 'dish tech' }, { char: '🔭', tags: 'scope tech' }, { char: '🧪', tags: 'flask tech' },
  { char: '💠', tags: 'diamond symbol' }, { char: '🔱', tags: 'trident symbol' }, { char: '⚜️', tags: 'fleur symbol' }, { char: '⚕️', tags: 'medical symbol' }, { char: '♾️', tags: 'infinity symbol' },
  { char: '☣️', tags: 'bio symbol hazard' }, { char: '☢️', tags: 'radio symbol hazard' }, { char: '☯️', tags: 'yin symbol' }, { char: '☮️', tags: 'peace symbol' }, { char: '☪️', tags: 'star symbol' },
  { char: '🕉️', tags: 'om symbol' }, { char: '☸️', tags: 'wheel symbol' }, { char: '🔯', tags: 'star symbol' }, { char: '✡️', tags: 'jewish symbol' }, { char: '✝️', tags: 'cross symbol' },
  { char: '🍄', tags: 'shroom nature unique' }, { char: '🐚', tags: 'shell nature' }, { char: '🦪', tags: 'oyster nature' }, { char: '🐙', tags: 'octopus animal unique' }, { char: '🦖', tags: 'dino animal' },
  { char: '🐉', tags: 'dragon animal unique' }, { char: '🦄', tags: 'unicorn animal' }, { char: '🌵', tags: 'cactus nature' }, { char: '🌴', tags: 'palm nature' }, { char: '🌻', tags: 'flower nature' },
  { char: '🍁', tags: 'maple nature' }, { char: '🍃', tags: 'leaf nature' }, { char: '🍒', tags: 'cherry food' }, { char: '🍓', tags: 'berry food' }, { char: '🥑', tags: 'avo food' },
  { char: '👺', tags: 'goblin chaos' }, { char: '👽', tags: 'alien chaos' }, { char: '💀', tags: 'skull chaos' }, { char: '🤡', tags: 'clown chaos' }, { char: '🤖', tags: 'robot chaos tech' },
  { char: '👹', tags: 'ogre chaos' }, { char: '👻', tags: 'ghost chaos' }, { char: '🕵️', tags: 'spy chaos' }, { char: '🧛', tags: 'vamp chaos' }, { char: '🧟', tags: 'zomb chaos' },
  { char: '🧞', tags: 'genie chaos' }, { char: '🧜', tags: 'mer chaos' }, { char: '🧚', tags: 'fairy chaos' }, { char: '🧙', tags: 'wiz chaos' }, { char: '🧝', tags: 'elf chaos' },
  { char: '🖤', tags: 'heart black' }, { char: '💔', tags: 'heart broken' }, { char: '❣️', tags: 'heart' }, { char: '💕', tags: 'hearts' }, { char: '💘', tags: 'heart arrow' },
  { char: '🧿', tags: 'eye' }, { char: '👁️‍🗨️', tags: 'eye bubble' }, { char: '🗨️', tags: 'bubble' }, { char: '🗯️', tags: 'shout' }, { char: '💭', tags: 'think' },
  { char: '💎', tags: 'gem' }, { char: '💍', tags: 'ring' }, { char: '👑', tags: 'crown' }, { char: '👒', tags: 'hat' }, { char: '🎒', tags: 'bag' },
  { char: '🕶️', tags: 'cool' }, { char: '👔', tags: 'suit' }, { char: '👗', tags: 'dress' }, { char: '👘', tags: 'kimono' }, { char: '👙', tags: 'bikini' },
  { char: '🧤', tags: 'glove' }, { char: '🧣', tags: 'scarf' }, { char: '🧥', tags: 'coat' }, { char: '🧦', tags: 'sock' }, { char: '👡', tags: 'shoe' },
  { char: '👠', tags: 'shoe' }, { char: '👢', tags: 'boot' }, { char: '👞', tags: 'shoe' }, { char: '👟', tags: 'shoe' }, { char: '🥾', tags: 'boot' },
  { char: '🥿', tags: 'shoe' }, { char: '🩰', tags: 'dance' }, { char: '👝', tags: 'bag' }, { char: '👜', tags: 'bag' }, { char: '💼', tags: 'bag' },
  { char: '🎒', tags: 'bag' }, { char: '🌂', tags: 'rain' }, { char: '☂️', tags: 'rain' }, { char: '🧶', tags: 'knit' }, { char: '🧵', tags: 'sew' },
  { char: '🪡', tags: 'needle' }, { char: '🪢', tags: 'knot' }, { char: '🪝', tags: 'hook' }, { char: '🪞', tags: 'mirror' }, { char: '🪟', tags: 'window' },
  { char: '🪑', tags: 'chair' }, { char: '🪒', tags: 'razor' }, { char: '🪤', tags: 'trap' }, { char: '🪣', tags: 'bucket' }, { char: '🪥', tags: 'brush' },
  { char: '🪦', tags: 'grave' }, { char: '🪧', tags: 'sign' }, { char: '🪨', tags: 'stone' }, { char: '🪵', tags: 'wood' }, { char: '🛖', tags: 'hut' },
  { char: '🪴', tags: 'plant' }, { char: '🩺', tags: 'doc' }, { char: '💊', tags: 'pill' }, { char: '🩹', tags: 'bandage' }, { char: '🧬', tags: 'dna' },
  { char: '🧪', tags: 'lab' }, { char: '🌡️', tags: 'heat' }, { char: '🩺', tags: 'med' }, { char: '🪠', tags: 'plunger' }, { char: '🪜', tags: 'ladder' },
  { char: '🪚', tags: 'saw' }, { char: '🪛', tags: 'screw' }, { char: '🪜', tags: 'wheel' }, { char: '🪝', tags: 'hook' }, { char: '🔭', tags: 'star' },
  { char: '🔬', tags: 'micro' }, { char: '🛰️', tags: 'sat' }, { char: '🚀', tags: 'rocket' }, { char: '🛸', tags: 'ufo' }, { char: '🚁', tags: 'heli' },
  { char: '🛶', tags: 'boat' }, { char: '⛵', tags: 'boat' }, { char: '🛥️', tags: 'boat' }, { char: '🚤', tags: 'boat' }, { char: '⛴️', tags: 'boat' },
  { char: '🚢', tags: 'boat' }, { char: '⚓', tags: 'anchor' }, { char: '🛟', tags: 'life' }, { char: '🏗️', tags: 'build' }, { char: '🧱', tags: 'brick' },
  { char: '🏘️', tags: 'house' }, { char: '🏚️', tags: 'house' }, { char: '🏠', tags: 'house' }, { char: '🏡', tags: 'house' }, { char: '🏢', tags: 'office' },
  { char: '🏣', tags: 'post' }, { char: '🏤', tags: 'post' }, { char: '🏥', tags: 'med' }, { char: '🏦', tags: 'bank' }, { char: '🏨', tags: 'hotel' },
  { char: '🏩', tags: 'hotel' }, { char: '🏪', tags: 'store' }, { char: '🏫', tags: 'school' }, { char: '🏬', tags: 'store' }, { char: '🏭', tags: 'factory' },
  { char: '🏯', tags: 'castle' }, { char: '🏰', tags: 'castle' }, { char: '💒', tags: 'wedding' }, { char: '🗼', tags: 'tower' }, { char: '🗽', tags: 'liberty' },
  { char: '⛪', tags: 'church' }, { char: '🕌', tags: 'mosque' }, { char: '🛕', tags: 'temple' }, { char: '🕍', tags: 'syn' }, { char: '⛩️', tags: 'shrine' },
  { char: '🕋', tags: 'kaaba' }, { char: '⛲', tags: 'fount' }, { char: '⛺', tags: 'tent' }, { char: '🌁', tags: 'fog' }, { char: '🌃', tags: 'night' },
  { char: '🏙️', tags: 'city' }, { char: '🌄', tags: 'sun' }, { char: '🌅', tags: 'sun' }, { char: '🌆', tags: 'city' }, { char: '🌇', tags: 'city' },
  { char: '🌉', tags: 'bridge' }, { char: '♨️', tags: 'hot' }, { char: '🎠', tags: 'horse' }, { char: '🎡', tags: 'wheel' }, { char: '🎢', tags: 'ride' },
  { char: '🚂', tags: 'train' }, { char: '🚃', tags: 'train' }, { char: '🚄', tags: 'train' }, { char: '🚅', tags: 'train' }, { char: '🚆', tags: 'train' },
  { char: '🚇', tags: 'train' }, { char: '🚈', tags: 'train' }, { char: '🚉', tags: 'train' }, { char: '💨', tags: 'dash' }, { char: '🚴', tags: 'cycle' },
  { char: '🤳', tags: 'selfie' }, { char: '🤙', tags: 'call' }, { char: '🤞', tags: 'luck' }, { char: '🤟', tags: 'love' }, { char: '🤘', tags: 'rock' },
  { char: '🤛', tags: 'fist' }, { char: '🤜', tags: 'fist' }, { char: '🤲', tags: 'pray' }, { char: '🤝', tags: 'hand' }, { char: '🕵️', tags: 'spy' },
  { char: '👮', tags: 'cop' }, { char: '👷', tags: 'build' }, { char: '💂', tags: 'guard' }, { char: '🕵️‍♀️', tags: 'spy' }, { char: '🕵️‍♂️', tags: 'spy' },
  { char: '🤴', tags: 'king' }, { char: '👸', tags: 'queen' }, { char: '🧙', tags: 'wiz' }, { char: '🧙‍♀️', tags: 'wiz' }, { char: '🧙‍♂️', tags: 'wiz' },
  { char: '🧚', tags: 'fairy' }, { char: '🧚‍♀️', tags: 'fairy' }, { char: '🧚‍♂️', tags: 'fairy' }, { char: '🧛', tags: 'vamp' }, { char: '🧛‍♀️', tags: 'vamp' },
  { char: '🧛‍♂️', tags: 'vamp' }, { char: '🧜', tags: 'mer' }, { char: '🧜‍♀️', tags: 'mer' }, { char: '🧜‍♂️', tags: 'mer' }, { char: '🧝', tags: 'elf' },
  { char: '🧝‍♀️', tags: 'elf' }, { char: '🧝‍♂️', tags: 'elf' }, { char: '🧞', tags: 'genie' }, { char: '🧞‍♀️', tags: 'genie' }, { char: '🧞‍♂️', tags: 'genie' },
  { char: '🧟', tags: 'zomb' }, { char: '🧟‍♀️', tags: 'zomb' }, { char: '🧟‍♂️', tags: 'zomb' }, { char: '💆', tags: 'relax' }, { char: '💆‍♀️', tags: 'relax' },
  { char: '💆‍♂️', tags: 'relax' }, { char: '💇', tags: 'cut' }, { char: '💇‍♀️', tags: 'cut' }, { char: '💇‍♂️', tags: 'cut' }, { char: '🚶', tags: 'walk' },
  { char: '🚶‍♀️', tags: 'walk' }, { char: '🚶‍♂️', tags: 'walk' }, { char: '🏃', tags: 'run' }, { char: '🏃‍♀️', tags: 'run' }, { char: '🏃‍♂️', tags: 'run' },
  { char: '💃', tags: 'dance' }, { char: '🕺', tags: 'dance' }, { char: '🕴️', tags: 'suit' }, { char: '👯', tags: 'twin' }, { char: '👯‍♀️', tags: 'twin' },
  { char: '👯‍♂️', tags: 'twin' }, { char: '🧗', tags: 'climb' }, { char: '🧗‍♀️', tags: 'climb' }, { char: '🧗‍♂️', tags: 'climb' }, { char: '🧘', tags: 'zen' },
  { char: '🧘‍♀️', tags: 'zen' }, { char: '🧘‍♂️', tags: 'zen' }, { char: '🛀', tags: 'bath' }, { char: '🛌', tags: 'sleep' }, { char: '🗣️', tags: 'talk' },
  { char: '👤', tags: 'user' }, { char: '👥', tags: 'users' }, { char: '🫂', tags: 'hug' }, { char: '🏇', tags: 'horse' }, { char: '⛷️', tags: 'ski' },
  { char: '🏂', tags: 'snow' }, { char: '🏌️', tags: 'golf' }, { char: '🏌️‍♀️', tags: 'golf' }, { char: '🏌️‍♂️', tags: 'golf' }, { char: '🏄', tags: 'surf' },
  { char: '🏄‍♀️', tags: 'surf' }, { char: '🏄‍♂️', tags: 'surf' }, { char: '🚣', tags: 'boat' }, { char: '🚣‍♀️', tags: 'boat' }, { char: '🚣‍♂️', tags: 'boat' },
  { char: '🏊', tags: 'swim' }, { char: '🏊‍♀️', tags: 'swim' }, { char: '🏊‍♂️', tags: 'swim' }, { char: '⛹️', tags: 'ball' }, { char: '⛹️‍♀️', tags: 'ball' },
  { char: '⛹️‍♂️', tags: 'ball' }, { char: '🏋️', tags: 'lift' }, { char: '🏋️‍♀️', tags: 'lift' }, { char: '🏋️‍♂️', tags: 'lift' }, { char: '🚴', tags: 'cycle' },
  { char: '🚴‍♀️', tags: 'cycle' }, { char: '🚴‍♂️', tags: 'cycle' }, { char: '🚵', tags: 'mtb' }, { char: '🚵‍♀️', tags: 'mtb' }, { char: '🚵‍♂️', tags: 'mtb' },
  { char: '🏎️', tags: 'car' }, { char: '🏍️', tags: 'moto' }, { char: '🤸', tags: 'flip' }, { char: '🤸‍♀️', tags: 'flip' }, { char: '🤸‍♂️', tags: 'flip' },
  { char: '🤼', tags: 'wres' }, { char: '🤼‍♀️', tags: 'wres' }, { char: '🤼‍♂️', tags: 'wres' }, { char: '🤽', tags: 'water' }, { char: '🤽‍♀️', tags: 'water' },
  { char: '🤽‍♂️', tags: 'water' }, { char: '🤾', tags: 'hand' }, { char: '🤾‍♀️', tags: 'hand' }, { char: '🤾‍♂️', tags: 'hand' }, { char: '🤹', tags: 'jugg' },
  { char: '🤹‍♀️', tags: 'jugg' }, { char: '🤹‍♂️', tags: 'jugg' }, { char: '🧗', tags: 'climb' }, { char: '🧗‍♀️', tags: 'climb' }, { char: '🧗‍♂️', tags: 'climb' },
  { char: '🤺', tags: 'sword' }, { char: '🏇', tags: 'horse' }, { char: '⛷️', tags: 'ski' }, { char: '🏂', tags: 'snow' }, { char: '🏌️', tags: 'golf' },
  { char: '🏌️‍♀️', tags: 'golf' }, { char: '🏌️‍♂️', tags: 'golf' }, { char: '🏄', tags: 'surf' }, { char: '🏄‍♀️', tags: 'surf' }, { char: '🏄‍♂️', tags: 'surf' },
  { char: '🚣', tags: 'boat' }, { char: '🚣‍♀️', tags: 'boat' }, { char: '🚣‍♂️', tags: 'boat' }, { char: '🏊', tags: 'swim' }, { char: '🏊‍♀️', tags: 'swim' },
  { char: '🏊‍♂️', tags: 'swim' }, { char: '⛹️', tags: 'ball' }, { char: '⛹️‍♀️', tags: 'ball' }, { char: '⛹️‍♂️', tags: 'ball' }, { char: '🏋️', tags: 'lift' },
  { char: '🏋️‍♀️', tags: 'lift' }, { char: '🏋️‍♂️', tags: 'lift' }, { char: '🚴', tags: 'cycle' }, { char: '🚴‍♀️', tags: 'cycle' }, { char: '🚴‍♂️', tags: 'cycle' },
  { char: '🚵', tags: 'mtb' }, { char: '🚵‍♀️', tags: 'mtb' }, { char: '🚵‍♂️', tags: 'mtb' }, { char: '🏎️', tags: 'car' }, { char: '🏍️', tags: 'moto' },
  { char: '🤸', tags: 'flip' }, { char: '🤸‍♀️', tags: 'flip' }, { char: '🤸‍♂️', tags: 'flip' }, { char: '🤼', tags: 'wres' }, { char: '🤼‍♀️', tags: 'wres' },
  { char: '🤼‍♂️', tags: 'wres' }, { char: '🤽', tags: 'water' }, { char: '🤽‍♀️', tags: 'water' }, { char: '🤽‍♂️', tags: 'water' }, { char: '🤾', tags: 'hand' },
  { char: '🤾‍♀️', tags: 'hand' }, { char: '🤾‍♂️', tags: 'hand' }, { char: '🤹', tags: 'jugg' }, { char: '🤹‍♀️', tags: 'jugg' }, { char: '🤹‍♂️', tags: 'jugg' },
  { char: '🧗', tags: 'climb' }, { char: '🧗‍♀️', tags: 'climb' }, { char: '🧗‍♂️', tags: 'climb' }, { char: '🤺', tags: 'sword' }, { char: '🏇', tags: 'horse' },
  { char: '⛷️', tags: 'ski' }, { char: '🏂', tags: 'snow' }, { char: '🏌️', tags: 'golf' }, { char: '🏌️‍♀️', tags: 'golf' }, { char: '🏌️‍♂️', tags: 'golf' },
  { char: '🏄', tags: 'surf' }, { char: '🏄‍♀️', tags: 'surf' }, { char: '🏄‍♂️', tags: 'surf' }, { char: '🚣', tags: 'boat' }, { char: '🚣‍♀️', tags: 'boat' },
  { char: '🚣‍♂️', tags: 'boat' }, { char: '🏊', tags: 'swim' }, { char: '🏊‍♀️', tags: 'swim' }, { char: '🏊‍♂️', tags: 'swim' }, { char: '⛹️', tags: 'ball' },
  { char: '⛹️‍♀️', tags: 'ball' }, { char: '⛹️‍♂️', tags: 'ball' }, { char: '🏋️', tags: 'lift' }, { char: '🏋️‍♀️', tags: 'lift' }, { char: '🏋️‍♂️', tags: 'lift' },
  { char: '🚴', tags: 'cycle' }, { char: '🚴‍♀️', tags: 'cycle' }, { char: '🚴‍♂️', tags: 'cycle' }, { char: '🚵', tags: 'mtb' }, { char: '🚵‍♀️', tags: 'mtb' },
  { char: '🚵‍♂️', tags: 'mtb' }, { char: '🏎️', tags: 'car' }, { char: '🏍️', tags: 'moto' }, { char: '🤸', tags: 'flip' }, { char: '🤸‍♀️', tags: 'flip' },
  { char: '🤸‍♂️', tags: 'flip' }, { char: '🤼', tags: 'wres' }, { char: '🤼‍♀️', tags: 'wres' }, { char: '🤼‍♂️', tags: 'wres' }, { char: '🤽', tags: 'water' },
  { char: '🤽‍♀️', tags: 'water' }, { char: '🤽‍♂️', tags: 'water' }, { char: '🤾', tags: 'hand' }, { char: '🤾‍♀️', tags: 'hand' }, { char: '🤾‍♂️', tags: 'hand' },
  { char: '🤹', tags: 'jugg' }, { char: '🤹‍♀️', tags: 'jugg' }, { char: '🤹‍♂️', tags: 'jugg' }, { char: '🧗', tags: 'climb' }, { char: '🧗‍♀️', tags: 'climb' },
  { char: '🧗‍♂️', tags: 'climb' }, { char: '🤺', tags: 'sword' }, { char: '🏇', tags: 'horse' }, { char: '⛷️', tags: 'ski' }, { char: '🏂', tags: 'snow' },
  { char: '🏌️', tags: 'golf' }, { char: '🏌️‍♀️', tags: 'golf' }, { char: '🏌️‍♂️', tags: 'golf' }, { char: '🏄', tags: 'surf' }, { char: '🏄‍♀️', tags: 'surf' },
  { char: '🏄‍♂️', tags: 'surf' }, { char: '🚣', tags: 'boat' }, { char: '🚣‍♀️', tags: 'boat' }, { char: '🚣‍♂️', tags: 'boat' }, { char: '🏊', tags: 'swim' },
  { char: '🏊‍♀️', tags: 'swim' }, { char: '🏊‍♂️', tags: 'swim' }, { char: '⛹️', tags: 'ball' }, { char: '⛹️‍♀️', tags: 'ball' }, { char: '⛹️‍♂️', tags: 'ball' },
  { char: '🏋️', tags: 'lift' }, { char: '🏋️‍♀️', tags: 'lift' }, { char: '🏋️‍♂️', tags: 'lift' }, { char: '🚴', tags: 'cycle' }, { char: '🚴‍♀️', tags: 'cycle' },
  { char: '🚴‍♂️', tags: 'cycle' }, { char: '🚵', tags: 'mtb' }, { char: '🚵‍♀️', tags: 'mtb' }, { char: '🚵‍♂️', tags: 'mtb' }, { char: '🏎️', tags: 'car' },
  { char: '🏍️', tags: 'moto' }, { char: '🤸', tags: 'flip' }, { char: '🤸‍♀️', tags: 'flip' }, { char: '🤸‍♂️', tags: 'flip' }, { char: '🤼', tags: 'wres' },
  { char: '🤼‍♀️', tags: 'wres' }, { char: '🤼‍♂️', tags: 'wres' }, { char: '🤽', tags: 'water' }, { char: '🤽‍♀️', tags: 'water' }, { char: '🤽‍♂️', tags: 'water' },
  { char: '🤾', tags: 'hand' }, { char: '🤾‍♀️', tags: 'hand' }, { char: '🤾‍♂️', tags: 'hand' }, { char: '🤹', tags: 'jugg' }, { char: '🤹‍♀️', tags: 'jugg' },
  { char: '🤹‍♂️', tags: 'jugg' }, { char: '🧗', tags: 'climb' }, { char: '🧗‍♀️', tags: 'climb' }, { char: '🧗‍♂️', tags: 'climb' }, { char: '🤺', tags: 'sword' },
  { char: '🦁', tags: 'animal cat' }, { char: '🐯', tags: 'animal cat' }, { char: '🐆', tags: 'animal cat' }, { char: '🦓', tags: 'animal' }, { char: '🐘', tags: 'animal' },
  { char: '🦒', tags: 'animal' }, { char: '🦘', tags: 'animal' }, { char: '🐨', tags: 'animal' }, { char: '🐼', tags: 'animal' }, { char: '🐻', tags: 'animal' },
  { char: '🦊', tags: 'animal' }, { char: '🐰', tags: 'animal' }, { char: '🐹', tags: 'animal' }, { char: '🐭', tags: 'animal' }, { char: '🐱', tags: 'animal cat' },
  { char: '🐈', tags: 'animal cat' }, { char: '🐶', tags: 'animal dog' }, { char: '🐕', tags: 'animal dog' }, { char: '🐩', tags: 'animal dog' }, { char: '🐺', tags: 'animal' },
  { char: '🦄', tags: 'animal' }, { char: '🦓', tags: 'animal' }, { char: '🐴', tags: 'animal' }, { char: '🐎', tags: 'animal' }, { char: '🦌', tags: 'animal' },
  { char: '🐄', tags: 'animal' }, { char: '🐂', tags: 'animal' }, { char: '🐃', tags: 'animal' }, { char: '🐮', tags: 'animal' }, { char: '🐖', tags: 'animal' },
  { char: '🐗', tags: 'animal' }, { char: '🐑', tags: 'animal' }, { char: '🐏', tags: 'animal' }, { char: '🐐', tags: 'animal' }, { char: '🐪', tags: 'animal' },
  { char: '🐫', tags: 'animal' }, { char: '🦙', tags: 'animal' }, { char: '🦒', tags: 'animal' }, { char: '🐘', tags: 'animal' }, { char: '🦏', tags: 'animal' },
  { char: '🦛', tags: 'animal' }, { char: '🐭', tags: 'animal' }, { char: '🐁', tags: 'animal' }, { char: '🐀', tags: 'animal' }, { char: '🐹', tags: 'animal' },
  { char: '🐰', tags: 'animal' }, { char: '🐇', tags: 'animal' }, { char: '🐿️', tags: 'animal' }, { char: '🦔', tags: 'animal' }, { char: '🦇', tags: 'animal' },
  { char: '🐻', tags: 'animal' }, { char: '🐨', tags: 'animal' }, { char: '🐼', tags: 'animal' }, { char: '🐾', tags: 'animal' }, { char: '🦃', tags: 'bird' },
  { char: '🐔', tags: 'bird' }, { char: '🐓', tags: 'bird' }, { char: '🐣', tags: 'bird' }, { char: '🐤', tags: 'bird' }, { char: '🐥', tags: 'bird' },
  { char: '🐦', tags: 'bird' }, { char: '🐧', tags: 'bird' }, { char: '🕊️', tags: 'bird' }, { char: '🦅', tags: 'bird' }, { char: '🦆', tags: 'bird' },
  { char: '🦉', tags: 'bird' }, { char: '🐸', tags: 'animal' }, { char: '🐊', tags: 'animal' }, { char: '🐢', tags: 'animal' }, { char: '🦎', tags: 'animal' },
  { char: '🐍', tags: 'animal' }, { char: '🐲', tags: 'animal' }, { char: '🐉', tags: 'animal' }, { char: '🦕', tags: 'animal' }, { char: '🦖', tags: 'animal' },
  { char: '🐳', tags: 'fish' }, { char: '🐋', tags: 'fish' }, { char: '🐬', tags: 'fish' }, { char: '🐟', tags: 'fish' }, { char: '🐠', tags: 'fish' },
  { char: '🐡', tags: 'fish' }, { char: '🦈', tags: 'fish' }, { char: '🐙', tags: 'fish' }, { char: '🐚', tags: 'fish' }, { char: '🦀', tags: 'fish' },
  { char: '🦞', tags: 'fish' }, { char: '🦐', tags: 'fish' }, { char: '🦑', tags: 'fish' }, { char: '🐌', tags: 'bug' }, { char: '🦋', tags: 'bug' },
  { char: '🐛', tags: 'bug' }, { char: '🐜', tags: 'bug' }, { char: '🐝', tags: 'bug' }, { char: '🐞', tags: 'bug' }, { char: '🦗', tags: 'bug' },
  { char: '🕷️', tags: 'bug' }, { char: '🕸️', tags: 'bug' }, { char: '🦂', tags: 'bug' }, { char: '🦟', tags: 'bug' }, { char: '🏵️', tags: 'flower' },
  { char: '🌹', tags: 'flower' }, { char: '🥀', tags: 'flower' }, { char: '🌺', tags: 'flower' }, { char: '🌻', tags: 'flower' }, { char: '🌼', tags: 'flower' },
  { char: '🌷', tags: 'flower' }, { char: '🌱', tags: 'plant' }, { char: '🌲', tags: 'tree' }, { char: '🌳', tags: 'tree' }, { char: '🌴', tags: 'tree' },
  { char: '🌵', tags: 'plant' }, { char: '🌾', tags: 'plant' }, { char: '🌿', tags: 'plant' }, { char: '☘️', tags: 'plant' }, { char: '🍀', tags: 'plant' },
  { char: '🍁', tags: 'leaf' }, { char: '🍂', tags: 'leaf' }, { char: '🍃', tags: 'leaf' }, { char: '🍄', tags: 'plant' }, { char: '🌍', tags: 'earth' },
  { char: '🌎', tags: 'earth' }, { char: '🌏', tags: 'earth' }, { char: '🌐', tags: 'earth' }, { char: '🗺️', tags: 'map' }, { char: '🗾', tags: 'map' },
  { char: '🌋', tags: 'mt' }, { char: '🏔️', tags: 'mt' }, { char: '⛰️', tags: 'mt' }, { char: '🏔️', tags: 'mt' }, { char: '🗻', tags: 'mt' },
  { char: '🏕️', tags: 'camp' }, { char: '🏖️', tags: 'beach' }, { char: '🏜️', tags: 'desert' }, { char: '🏝️', tags: 'island' }, { char: '🏞️', tags: 'park' },
];

const EMOJI_LIBRARY = {
  "VIBE": ['✨', '🔥', '🌈', '🌪️', '🌊', '⚡', '🌌', '🌠', '🌑', '🌕'],
  "SYMBOLS": ['💎', '💍', '👑', '🎩', '🎯', '🎰', '🎲', '🎳', '🎨'],
  "FACES": ['👺', '👽', '💀', '🤡', '🤖', '👹', '👻', '🕵️', '🧛', '🧟'],
  "NATURE": ['🍄', '🐚', '🦪', '🐙', '🦖', '🐉', '🦄', '🌵', '🌴', '🌻'],
  "HEARTS": ['🖤', '💔', '❣️', '💕', '💘', '💖', '💗', '💓', '💞', '💟']
};


const Header = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <header className="header">
            <div className="container header-content">
                <Link to="/" className="logo">
                    CCHAT<span>.</span>
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div className="live-status">
                        <Radio size={16} color="#FF4B5C" /> 6 LIVE
                    </div>
                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <Link to="/messages" style={{ color: 'var(--text-color)', display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                                <MessageCircle size={24} />
                            </Link>
                        </div>
                    ) : (
                        <Link to="/login" className="badge" style={{ textDecoration: 'none' }}>LOGIN</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

const getInitials = (name) => {
  if (!name || name === 'ShadowWave') return '?';
  const parts = name.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarStyle = (username, index) => {
  if (username === 'ShadowWave' || index > 1) {
    return {
      background: '#F3F4F6',
      color: '#9CA3AF',
      border: '2px dashed #D1D5DB',
    };
  }
  return {
    background: index === 0 ? 'var(--accent-color)' : '#000000',
    color: '#ffffff',
    border: 'none',
  };
};

const ThreadCard = ({ thread, currentUser }) => {
  const participants = thread.chatters || [];
  const latestMessages = thread.messages ? thread.messages.slice(-6) : [];

  return (
    <Link to={`/chat/${thread.conversation_id}`} className="thread-card">
      <div className="thread-header">
        <span>THREAD #{String(thread.conversation_id).padStart(3, '0')}</span>
        <span style={{ opacity: 0.6 }}>{thread.created_at || 'active'}</span>
      </div>
      <div className="thread-participants">
        {participants.map((p, i) => (
          <React.Fragment key={i}>
            <div className="participant" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                className="avatar"
                style={{
                  ...getAvatarStyle(p.username, i),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.9rem'
                }}
              >
                {getInitials(p.username)}
              </div>
              <span className="participant-name" style={{ color: getAvatarStyle(p.username, i).background }}>{p.username}</span>
            </div>
            {i < participants.length - 1 && <span style={{ opacity: 0.3, fontWeight: 900, margin: '0 0.5rem' }}>×</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="thread-preview">
        {latestMessages.map((msg, i) => {
          const sender = msg.sender_username || msg.sender;
          const isMe = currentUser && sender && (sender.toUpperCase() === currentUser.username.toUpperCase() || sender.toUpperCase() === 'YOU');
          return (
            <div key={i} className="preview-line">
              <span style={{ color: 'var(--accent-color)' }}>
                {isMe ? 'YOU' : (msg.sender_username?.toUpperCase() || msg.sender?.toUpperCase() || 'ANON')}:
              </span> {msg.text}
            </div>
          );
        })}
      </div>
      <div className="thread-footer">
        <div className="reactions">
          <div className="reaction-pill"><Flame size={14} fill="#F97316" color="#F97316" /> {thread.likes ?? 0}</div>
          <div className="reaction-pill"><Skull size={14} /> {thread.dislikes ?? 0}</div>
          <div className="reaction-pill"><Heart size={14} fill="#FF4B5C" color="#FF4B5C" /> {thread.caps ?? 0}</div>
        </div>
        <div className="thread-meta">
          <Eye size={14} /> {thread.views || '3,872'}
        </div>
      </div>
    </Link>
  );
};

const mockThreads = [
  {
    conversation_id: 1,
    chatters: [{ username: 'Alex Chen' }, { username: 'NeonWraith' }],
    messages: [
      { sender_username: 'ALEX', text: 'should we switch to rust for the backend?' },
      { sender_username: 'ANON', text: 'the memory safety alone makes it worth considering' },
      { sender_username: 'ALEX', text: 'but the learning curve for the team...' },
      { sender_username: 'ANON', text: 'we could start with one microservice' },
      { sender_username: 'ALEX', text: 'good call. let\'s prototype the auth service' },
      { sender_username: 'ANON', text: 'I\'ll set up the repo tonight' }
    ],
    created_at: '6 days ago',
    likes: 12, dislikes: 5, caps: 31, views: 560
  },
  {
    conversation_id: 4,
    chatters: [{ username: 'StealthCipher' }, { username: 'PixelLynx' }],
    messages: [
      { sender_username: 'ANON', text: 'did you see the new quantum processor specs?' },
      { sender_username: 'ANON', text: 'yeah 2048 qubits is insane' },
      { sender_username: 'ANON', text: 'imagine running ML models on that' },
      { sender_username: 'ANON', text: 'we\'d need to rethink our entire architecture' }
    ],
    created_at: '5 days ago',
    likes: 20, dislikes: 25, caps: 69, views: '4,554'
  },
  {
    conversation_id: 7,
    chatters: [{ username: 'SarahV' }, { username: 'CodeNinja' }],
    messages: [
      { sender_username: 'SARAH', text: 'CSS grid or flexbox for the new dashboard?' },
      { sender_username: 'NINJA', text: 'grid for the overall layout, flexbox for components inside' },
      { sender_username: 'SARAH', text: 'makes sense. getting tired of nested divs' },
      { sender_username: 'NINJA', text: 'CSS subgrid is shipping in all browsers now though' },
      { sender_username: 'SARAH', text: 'Wait really? Finally!' }
    ],
    created_at: '2 hrs ago',
    likes: 45, dislikes: 2, caps: 88, views: '1,200'
  },
  {
    conversation_id: 12,
    chatters: [{ username: 'UX_Master' }, { username: 'DevOpsDan' }],
    messages: [
      { sender_username: 'UX', text: 'the deployment pipeline is taking 45 minutes now...' },
      { sender_username: 'DAN', text: 'I know, the test suite bloated up' },
      { sender_username: 'DAN', text: 'I am splitting it into parallel jobs today' },
      { sender_username: 'UX', text: 'thank god, I can\'t iterate fast enough' }
    ],
    created_at: '12 mins ago',
    likes: 104, dislikes: 12, caps: 201, views: '8,900'
  },
  {
    conversation_id: 15,
    chatters: [{ username: 'RogueOne' }, { username: 'Echo' }],
    messages: [
      { sender_username: 'ROGUE', text: 'is the staging server down?' },
      { sender_username: 'ECHO', text: 'restarting the database, give it 2 mins' }
    ],
    created_at: '1 min ago',
    likes: 3, dislikes: 0, caps: 5, views: '32'
  },
  {
    conversation_id: 19,
    chatters: [{ username: 'VibeCheck' }, { username: 'NullPointer' }],
    messages: [
      { sender_username: 'VIBE', text: 'anyone else feel like AI is moving too fast?' },
      { sender_username: 'NULL', text: 'we literally can\'t keep up with the papers anymore' },
      { sender_username: 'VIBE', text: 'I gave up reading arxiv daily, it\'s overwhelming' },
      { sender_username: 'NULL', text: 'just follow the summaries on twitter honestly' },
      { sender_username: 'VIBE', text: 'fair. but then you miss the details that matter' },
      { sender_username: 'NULL', text: 'true... pick your battles I guess' },
      { sender_username: 'VIBE', text: 'the next 6 months are going to be wild though' }
    ],
    created_at: 'just now',
    likes: 87, dislikes: 4, caps: 120, views: '6,210'
  }
];

const LandingPage = () => {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const token = localStorage.getItem('access');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        try {
            const userRes = await axios.get('/api/profile/', config);
            setCurrentUser(userRes.data);
        } catch (e) {
            console.log("Not logged in on landing page");
        }

        const response = await axios.get('/api/chats/recommended/', config);
        if (response.data && response.data.length > 0) {
          setThreads(response.data);
          localStorage.setItem('recommended_chats_ids', JSON.stringify(response.data.map(t => t.conversation_id)));
        } else {
          setThreads(mockThreads);
        }
      } catch (error) {
        console.error("Error fetching threads:", error);
        setThreads(mockThreads);
      } finally {
        setLoading(false);
      }
    };
    fetchThreads();
  }, []);

  return (
    <div style={{ background: 'var(--bg-color)', minHeight: '100vh' }}>
      <Header />
      <div className="container">
        <section className="hero">
          <div>
            <span className="hero-tag">Public Conversations</span>
            <h1 className="hero-title">
              READ<br />
              WHAT PEOPLE<br />
              <span style={{ color: 'var(--accent-color)' }}>ACTUALLY</span><br />
              SAY.
            </h1>
          </div>
          <div className="hero-card">
            <p className="hero-description">
              Browse real conversations between real people. Some choose to go public, others stay anonymous. React, scroll, discover.
            </p>
            <div className="hero-badges">
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>UNFILTERED</div>
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>REAL-TIME</div>
              <div className="badge" style={{ transform: 'rotate(-2deg)' }}>ANONYMOUS</div>
            </div>
          </div>
        </section>

        <div className="thread-grid">
          {loading ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', fontWeight: 900 }}>LOADING PULSES...</div>
          ) : (
            threads.map(thread => (
              <ThreadCard key={thread.conversation_id} thread={thread} currentUser={currentUser} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const mockChatData = {
  1: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)', is_public: true },
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000', is_public: false }
    ],
    messages: [
      { sender: 'ALEX', text: 'should we switch to rust for the backend?' },
      { sender: 'ANON', text: 'the memory safety alone makes it worth considering' },
      { sender: 'ALEX', text: 'but the learning curve for the team...' },
      { sender: 'ANON', text: 'we could start with one microservice' },
      { sender: 'ALEX', text: 'good call. let\'s prototype the auth service' },
      { sender: 'ANON', text: 'I\'ll set up the repo tonight' }
    ],
    status: 'HEATING UP',
    created_at: '6 days ago',
    visibility: 'PUBLIC',
    likes: 5, dislikes: 9, caps: 69, smiles: 34, views: '1,176', watching: 139,
    otherChats: {
      left: [{ id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }, { id: 12, username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280' }],
      right: [{ id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }, { id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }]
    }
  },
  4: {
    participants: [
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000', is_public: false },
      { username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6', is_public: true }
    ],
    messages: [
      { sender: 'NEON', text: 'Casey, have you seen the new quantum encryption protocol?' },
      { sender: 'CN', text: 'yeah, it is pretty impressive. 0.01ms latency.' },
      { sender: 'NEON', text: 'insane. we should integrate it into the core engine.' }
    ],
    status: 'ACTIVE',
    created_at: '5 days ago',
    visibility: 'PUBLIC',
    likes: 8, dislikes: 3, caps: 22, smiles: 15, views: '4,554', watching: 87,
    otherChats: {
      left: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }, { id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }],
      right: [{ id: 15, username: 'RogueOne', handle: '@rogueone', avatar: 'RO', color: 'var(--accent-color)' }]
    }
  },
  7: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)', is_public: true },
      { username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000', is_public: true }
    ],
    messages: [
      { sender: 'ALEX', text: 'Taylor, are we still on for the code review at 3?' },
      { sender: 'TK', text: 'yep, almost done with the auth module.' },
      { sender: 'ALEX', text: 'great, I found some interesting patterns in the middleware.' },
      { sender: 'TK', text: 'sweet, show me then.' }
    ],
    status: 'FRESH',
    created_at: '2 hrs ago',
    visibility: 'PUBLIC',
    likes: 12, dislikes: 1, caps: 45, smiles: 20, views: '1,200', watching: 56,
    otherChats: {
      left: [{ id: 1, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }, { id: 12, username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280' }],
      right: [{ id: 19, username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)' }]
    }
  },
  12: {
    participants: [
      { username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)', is_public: true },
      { username: 'Sam Rivera', handle: '@samrivera', avatar: 'SR', color: '#6B7280', is_public: true }
    ],
    messages: [
      { sender: 'ALEX', text: 'hey Sam, did you check the new design for the delivery map?' },
      { sender: 'SR', text: 'just looking at it now. the orange route looks much cleaner.' },
      { sender: 'ALEX', text: 'yeah, I think it helps with readability in the sun.' },
      { sender: 'SR', text: 'definitely. we should apply this aesthetic to the rest of the app.' }
    ],
    status: 'ACTIVE',
    created_at: '12 mins ago',
    visibility: 'PUBLIC',
    likes: 20, dislikes: 5, caps: 104, smiles: 12, views: '8,900', watching: 310,
    otherChats: {
      left: [{ id: 1, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }, { id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }],
      right: [{ id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }]
    }
  },
  15: {
    participants: [
      { username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6', is_public: true },
      { username: 'RogueOne', handle: '@rogueone', avatar: 'RO', color: 'var(--accent-color)', is_public: true }
    ],
    messages: [
      { sender: 'ROGUE', text: 'is the staging server down?' },
      { sender: 'ECHO', text: 'restarting the database, give it 2 mins' }
    ],
    status: 'ACTIVE',
    created_at: '1 min ago',
    visibility: 'PUBLIC',
    likes: 1, dislikes: 0, caps: 3, smiles: 2, views: '32', watching: 8,
    otherChats: {
      left: [{ id: 4, username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000' }],
      right: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }]
    }
  },
  19: {
    participants: [
      { username: 'NeonWraith', handle: '@neonwraith', avatar: 'NE', color: '#000', is_public: false },
      { username: 'Jordan Blake', handle: '@jordanblake', avatar: 'JB', color: 'var(--accent-color)', is_public: true }
    ],
    messages: [
      { sender: 'NEON', text: 'Jordan, the AI models are evolving way too fast.' },
      { sender: 'JB', text: 'tell me about it. the new papers are coming out every hour.' },
      { sender: 'NEON', text: 'I am taking a break from Arxiv, just following the summaries now.' },
      { sender: 'JB', text: 'wise choice. let the dust settle first.' }
    ],
    status: 'HEATING UP',
    created_at: 'just now',
    visibility: 'PUBLIC',
    likes: 22, dislikes: 3, caps: 87, smiles: 14, views: '6,210', watching: 201,
    otherChats: {
      left: [{ id: 1, username: 'Alex Chen', handle: '@alexchen', avatar: 'AC', color: 'var(--accent-color)' }, { id: 4, username: 'Casey Nguyen', handle: '@caseynguyen', avatar: 'CN', color: '#8B5CF6' }],
      right: [{ id: 7, username: 'Taylor Kim', handle: '@taylorkim', avatar: 'TK', color: '#000' }]
    }
  }
};

const availableIds = [1, 7, 12, 15, 19];

const NavigationArrows = ({ onNext, onPrev }) => (
  <div className="nav-arrows-container">
    <button className="nav-arrow" onClick={onPrev} aria-label="Previous Chat">
      <ChevronUp size={24} />
    </button>
    <button className="nav-arrow" onClick={onNext} aria-label="Next Chat">
      <ChevronDown size={24} />
    </button>
  </div>
);

const ProfileSidebar = ({ participant, otherChats = [], messageCount, currentUser }) => {
  if (!participant) return null;
  const isMe = currentUser && participant.username && (participant.username.toUpperCase() === currentUser.username.toUpperCase() || participant.username.toUpperCase() === 'YOU');
  return (
  <div className="chat-sidebar">
    <div className="profile-card">
      <div className="profile-avatar-large" style={{ 
        background: participant.is_public ? participant.color : '#F3F4F6',
        color: participant.is_public ? '#fff' : '#9CA3AF',
        border: participant.is_public ? 'none' : '2px dashed #D1D5DB'
      }}>
        {participant.avatar}
      </div>
      <div className="profile-name">{isMe ? 'YOU' : participant.username}</div>
      <div className="profile-handle">{participant.handle}</div>
      <div className="profile-badge" style={{ 
        borderColor: participant.is_public ? 'var(--accent-color)' : '#9CA3AF',
        color: participant.is_public ? 'var(--accent-color)' : '#9CA3AF',
        transform: 'rotate(-2deg)'
      }}>
        {participant.is_public ? 'PUBLIC' : 'ANONYMOUS'}
      </div>
      <div className="profile-stat">
        <span>MESSAGES</span>
        <span>{messageCount || 0}</span>
      </div>
    </div>
    <div className="other-chats-section">
      <div className="other-chats-title">OTHER CHATS BY {isMe ? 'YOU' : participant.username?.split(' ')[0].toUpperCase()}</div>
      {(otherChats || []).map((chat, i) => (
        <Link key={i} to={`/chat/${chat.id}`} className="other-chat-item">
          <div className="other-chat-avatar" style={{ background: chat.color }}>{chat.avatar}</div>
          <div>
            <div className="other-chat-name">{chat.username}</div>
            <div className="other-chat-handle">{chat.handle}</div>
          </div>
        </Link>
      ))}
    </div>
    <div className="ad-card">
      <div className="ad-badge">SPONSOR</div>
      <div className="ad-title">NEO-DRIVE</div>
      <div className="ad-text">Fast. Secure. Brutalist. Get the new SSD now.</div>
    </div>
  </div>
  );
};

const ChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const messagesRef = useRef(null);
  const [selectedProfileModal, setSelectedProfileModal] = useState(null);

  const formatChatTime = (ts) => {
      if (!ts || ts === 'just now') return ts;
      const d = new Date(ts);
      if (isNaN(d.getTime())) return ts;
      const now = new Date();
      const diff = now - d;
      if (diff < 86400000) {
          return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  const [direction, setDirection] = useState(0);


  const spawnFloatingReaction = (type) => {
    const id = Date.now() + Math.random();
    
    // Map reaction types to their approximate horizontal positions
    const positions = {
      'like': 22,
      'dislike': 40,
      'cap': 58,
      'smile': 76
    };
    
    // Add jitter so multiple clicks don't overlap perfectly
    const basePercent = positions[type] || 50;
    const jitter = (Math.random() * 8) - 4; // +/- 4%
    const x = basePercent + jitter;
    
    setFloatingReactions(prev => [...prev, { id, type, x }]);
    setTimeout(() => {
      setFloatingReactions(prev => prev.filter(r => r.id !== id));
    }, 4000);
  };

  const isNavigatingRef = useRef(false);

  const currentIdIndexRaw = (() => {
    const cached = localStorage.getItem('recommended_chats_ids');
    const dynamicIds = cached ? JSON.parse(cached) : availableIds;
    const index = dynamicIds.indexOf(Number(id));
    return index !== -1 ? index : 0;
  })();

  const getDynamicIds = () => {
      const cached = localStorage.getItem('recommended_chats_ids');
      return cached ? JSON.parse(cached) : availableIds;
  };

  const goNext = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setDirection(1);
    const dynamicIds = getDynamicIds();
    const currentIdIndex = dynamicIds.indexOf(Number(id)) !== -1 ? dynamicIds.indexOf(Number(id)) : 0;
    const nextIndex = (currentIdIndex + 1) % dynamicIds.length;
    navigate(`/chat/${dynamicIds[nextIndex]}`);
    setTimeout(() => { isNavigatingRef.current = false; }, 700);
  };

  const goPrev = () => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    setDirection(-1);
    const dynamicIds = getDynamicIds();
    const currentIdIndex = dynamicIds.indexOf(Number(id)) !== -1 ? dynamicIds.indexOf(Number(id)) : 0;
    const prevIndex = (currentIdIndex - 1 + dynamicIds.length) % dynamicIds.length;
    navigate(`/chat/${dynamicIds[prevIndex]}`);
    setTimeout(() => { isNavigatingRef.current = false; }, 700);
  };

  useEffect(() => {
    let pullAmount = 0;
    const threshold = 300; // slightly harder to trigger navigation

    const handleWheel = (e) => {
      if (isNavigatingRef.current) return;
      const el = messagesRef.current;
      if (!el) return;

      if (e.deltaY > 0) {
        // Scrolling down
        const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 8;
        if (atBottom) {
          pullAmount += e.deltaY;
          if (pullAmount > threshold) {
            pullAmount = 0;
            goNext();
          }
        } else {
          pullAmount = 0;
        }
      } else if (e.deltaY < 0) {
        // Scrolling up
        const atTop = el.scrollTop <= 0;
        if (atTop) {
          pullAmount -= e.deltaY; // deltaY is negative, so subtract to add
          if (pullAmount > threshold) {
            pullAmount = 0;
            goPrev();
          }
        } else {
          pullAmount = 0;
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [id]);

  useEffect(() => {
    const mock = mockChatData[id];
    if (mock) {
      setChatData(mock);
      setMessages(mock.messages || []);
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('access');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        
        // Fetch current user profile first
        try {
            const userRes = await axios.get('/api/profile/', config);
            setCurrentUser(userRes.data);
        } catch (e) {
            console.log("Not logged in");
            if (e.response && e.response.status === 401) {
                delete config.headers.Authorization;
            }
        }

        const response = await axios.get(`/api/conversations/${id}/`, config);
        
        if (response.data && response.data.conversation) {
            const conv = response.data.conversation;
            const participants = conv.participants || [];
            
            const newChatData = {
                participants: participants.map((p, i) => {
                    const uname = p.username || 'Anonymous';
                    return {
                        username: uname,
                        handle: `@${uname.toLowerCase().replace(/\s+/g, '')}`,
                        avatar: uname.slice(0, 2).toUpperCase(),
                        color: i === 0 ? 'var(--accent-color)' : '#000',
                        is_public: p.is_public ?? true
                    };
                }),
                status: 'ACTIVE',
                created_at: conv.created_at || 'just now',
                likes: conv.likes || 0,
                dislikes: conv.dislikes || 0,
                caps: conv.caps || 0,
                smiles: conv.smiles || 0,
                views: conv.views || 0,
                watching: 1,
                user_reactions: conv.user_reactions || [],
                otherChats: { 
                    left: conv.other_chats_left || [], 
                    right: conv.other_chats_right || [] 
                }
            };
            
            if (newChatData.participants.length < 2) {
                newChatData.participants.push({ username: 'ANON', handle: '@anon', avatar: 'AN', color: '#000', is_public: false });
            }
            
            setChatData(newChatData);
            
            if (response.data.messages) {
               setMessages(response.data.messages.map(m => ({
                   sender: m.sender_username || 'ANON',
                   text: m.text
               })));
            }
            return;
        }
      } catch (error) {
        console.error("Error fetching chat data:", error);
        // Fallback to mock data if API fails
        const mock = mockChatData[id];
        if (mock) {
            setChatData(mock);
            if (mock.messages) {
                setMessages(mock.messages.map(m => ({
                    sender: m.sender || m.sender_username || 'ANON',
                    text: m.text
                })));
            }
        } else {
            // Handle complete failure
            setChatData({ 
                participants: [
                    { username: 'ERROR', handle: '@error', avatar: 'ER', color: '#f00', is_public: true }, 
                    { username: 'ERROR', handle: '@error', avatar: 'ER', color: '#f00', is_public: true }
                ],
                status: 'OFFLINE',
                created_at: 'now',
                likes: 0, dislikes: 0, caps: 0, smiles: 0, views: 0, watching: 0,
                otherChats: { left: [], right: [] }
            });
        }
      }
    };
    fetchMessages();

    const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
    const ws = new WebSocket(`${wsBaseUrl}/ws/chat/${id}/`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'receive_message') {
        setMessages(prev => [...prev, {
          sender: data.sender_username || 'ANON',
          text: data.text
        }]);
      } else if (data.type === 'receive_conversation_reaction') {
        spawnFloatingReaction(data.reactionType);
      }
    };
    setSocket(ws);
    return () => ws.close();
  }, [id]);

  const handleReaction = async (type) => {
    const token = localStorage.getItem('access');
    if (!token) {
      navigate('/login');
      return;
    }

    // Trigger local animation immediately
    spawnFloatingReaction(type);
    
    // Broadcast via socket
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'conversation_reaction',
        reactionType: type,
        chatId: id
      }));
    }

    try {
      const res = await axios.post(`/api/conversations/${id}/react/`, 
        { reaction_type: type },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const conv = res.data;
      setChatData(prev => ({
        ...prev,
        likes: conv.likes,
        dislikes: conv.dislikes,
        caps: conv.caps,
        smiles: conv.smiles,
        user_reactions: conv.user_reactions
      }));
    } catch (err) {
      console.error("Failed to react:", err);
    }
  };

  if (!chatData) return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-color)', fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
      LOADING...
    </div>
  );

  const p1 = chatData.participants[0];
  const p2 = chatData.participants[1];
  const p1MsgCount = messages.filter(m => m.sender === p1.username.split(' ')[0].toUpperCase() || m.sender === p1.avatar).length || messages.length;
  const p2MsgCount = messages.filter(m => m.sender === p2.username.split(' ')[0].toUpperCase() || m.sender === p2.avatar).length || messages.length;

  const slideVariants = {
    enter: (dir) => ({ y: dir > 0 ? '100%' : '-100%', opacity: 1 }),
    center: { y: 0, opacity: 1 },
    exit: (dir) => ({ y: dir > 0 ? '-100%' : '100%', opacity: 1 }),
  };

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--bg-color)' }}>
      {/* Sticky header sits outside the animated area */}
      <header className="header chat-header-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 }}>
        <div className="header-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Link to="/" className="back-arrow"><ArrowLeft size={20} /></Link>
            <Link to="/" className="logo">CCHAT<span>.</span></Link>
          </div>
          <div className="live-status">
            <span>{id} / ∞</span>
            <div className="live-indicator">
              <div className="live-dot" /> LIVE
            </div>
          </div>
        </div>
      </header>

      {/* Full-viewport animated slides */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.38, ease: [0.32, 0.72, 0, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            paddingTop: '57px', // header height
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div className="chat-page-layout" style={{ flex: 1, minHeight: 0 }}>
            {/* Left sidebar */}
            <ProfileSidebar participant={p1} otherChats={chatData.otherChats.left} 
              messageCount={p1MsgCount} currentUser={currentUser} />

            {/* Center chat column — fills remaining height */}
            <div className="chat-center" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, height: '100%' }}>
              <div className="chat-thread-header">
                <div className="chat-thread-participants" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <div 
                    onClick={() => setSelectedProfileModal('left')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                    title={`View profile of ${p1.username}`}
                  >
                    <div className="chat-thread-avatar" style={{ background: p1.color }}>{p1.avatar}</div>
                    <span className="chat-thread-name">{p1.username}</span>
                  </div>
                  <span className="chat-vs">vs</span>
                  <div 
                    onClick={() => setSelectedProfileModal('right')}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
                    title={`View profile of ${p2.username}`}
                  >
                    <div className="chat-thread-avatar" style={{ background: p2.color }}>{p2.avatar}</div>
                    <span className="chat-thread-name">{p2.username}</span>
                  </div>
                </div>
                <div className="chat-thread-meta">
                  <span className="chat-status-badge">{chatData.status}</span>
                  <span className="chat-time">{formatChatTime(chatData.created_at).toUpperCase()}</span>
                </div>
              </div>

              {/* Scrollable messages — this is what the user scrolls through */}
              <div
                className="chat-messages-list"
                ref={messagesRef}
                style={{ flex: 1, overflowY: 'auto', minHeight: 0, position: 'relative' }}
              >
                <AnimatePresence>
                  {floatingReactions.map(r => (
                    <motion.div
                      key={r.id}
                      initial={{ y: 0, x: `${r.x}%`, opacity: 0, scale: 0.5 }}
                      animate={{ 
                        y: -500, 
                        opacity: [0, 1, 1, 0], 
                        scale: [0.5, 1.4, 1.2, 0.6],
                        x: [
                          `${r.x}%`, 
                          `${r.x + (Math.random() * 20 - 10)}%`, // sway left/right
                          `${r.x + (Math.random() * 30 - 15)}%`, // sway further
                          `${r.x + (Math.random() * 20 - 10)}%`  // come back slightly
                        ] 
                      }}
                      transition={{ duration: 4, ease: "easeOut" }}
                      style={{
                        position: 'absolute',
                        bottom: 40,
                        zIndex: 10,
                        pointerEvents: 'none',
                        color: r.type === 'like' ? '#3B82F6' : 
                               r.type === 'dislike' ? '#4B5563' : 
                               r.type === 'cap' ? '#FF4B5C' : '#F59E0B'
                      }}
                    >
                      {r.type === 'like' && <ThumbsUp size={32} fill="#3B82F6" stroke="#fff" strokeWidth={1.5} />}
                      {r.type === 'dislike' && <Skull size={32} fill="#4B5563" stroke="#fff" strokeWidth={1.5} />}
                      {r.type === 'cap' && <Heart size={32} fill="#FF4B5C" stroke="#fff" strokeWidth={1.5} />}
                      {r.type === 'smile' && <Laugh size={32} fill="#F59E0B" stroke="#fff" strokeWidth={1.5} />}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    className="chat-message-row"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + (i * 0.04), duration: 0.25 }}
                  >
                  {(() => {
                    const senderName = msg.sender || msg.sender_username || 'ANON';
                    const senderUpper = senderName.toUpperCase();
                    const isMe = currentUser && (senderUpper === currentUser.username.toUpperCase() || senderUpper === 'YOU');
                    
                    const p1 = chatData.participants[0];
                    const isP1 = p1.username.toUpperCase().includes(senderUpper) || 
                                 senderUpper.includes(p1.username.toUpperCase()) || 
                                 p1.avatar.toUpperCase() === senderUpper;
                    const participant = isP1 ? p1 : chatData.participants[1];
                    const color = participant ? participant.color : 'var(--accent-color)';
                    
                    return (
                      <div className="chat-msg-container">
                        <div className="chat-msg-line">
                          <span className="chat-msg-sender" style={{ color }}>{isMe ? 'YOU' : senderName.toUpperCase()}:</span>
                          {msg.message_type === 'image' ? (
                            <div className="chat-image-msg" style={{ marginTop: 8 }}>
                              <img 
                                src={msg.attachment} 
                                alt="shared" 
                                style={{ 
                                  maxWidth: '100%', 
                                  maxHeight: 300,
                                  borderRadius: 4, 
                                  border: '3px solid #000',
                                  boxShadow: '4px 4px 0 #000'
                                }} 
                              />
                            </div>
                          ) : msg.message_type === 'audio' ? (
                            <div className="chat-audio-msg" style={{ 
                              marginTop: 8, 
                              background: '#000', 
                              color: '#fff', 
                              padding: '12px',
                              borderRadius: 4,
                              border: '3px solid var(--accent-color)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 12,
                              minWidth: 200
                            }}>
                              <Music size={24} />
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 10, fontWeight: 900, marginBottom: 4 }}>{msg.text}</div>
                                <audio controls src={msg.attachment} style={{ width: '100%', height: 30 }} />
                              </div>
                            </div>
                          ) : (
                            <span className="chat-msg-text">{msg.text}</span>
                          )}
                        </div>
                        <div className="chat-msg-actions">
                          <span className="chat-action">+ react</span>
                          <MessageCircle size={12} />
                          <span>0 ∨</span>
                        </div>
                      </div>
                    );
                  })()}
                  </motion.div>
                ))}

                {/* End marker lives inside the scroll so it's the scroll target */}
                <div className="chat-end-marker">
                  <span>📁 END OF CONVERSATION · scroll to reveal next</span>
                </div>
              </div>

              {/* Reactions bar pinned at bottom of center column */}
              <div className="chat-reactions-bar">
                <div className="reactions">
                  <div 
                    className={`reaction-pill ${chatData.user_reactions?.includes('like') ? 'active' : ''}`}
                    onClick={() => handleReaction('like')}
                    style={{ 
                      cursor: 'pointer',
                      background: chatData.user_reactions?.includes('like') ? 'rgba(59, 130, 246, 0.1)' : '#fff',
                      borderColor: chatData.user_reactions?.includes('like') ? '#3B82F6' : '#000',
                      borderWidth: '2px',
                      color: chatData.user_reactions?.includes('like') ? '#3B82F6' : '#000'
                    }}
                  >
                    <ThumbsUp size={14} fill={chatData.user_reactions?.includes('like') ? "#3B82F6" : "transparent"} stroke={chatData.user_reactions?.includes('like') ? "#fff" : "#000"} strokeWidth={2} /> {chatData.likes}
                  </div>
                  <div 
                    className={`reaction-pill ${chatData.user_reactions?.includes('dislike') ? 'active' : ''}`}
                    onClick={() => handleReaction('dislike')}
                    style={{ 
                      cursor: 'pointer',
                      background: chatData.user_reactions?.includes('dislike') ? 'rgba(75, 85, 99, 0.1)' : '#fff',
                      borderColor: chatData.user_reactions?.includes('dislike') ? '#4B5563' : '#000',
                      borderWidth: '2px',
                      color: chatData.user_reactions?.includes('dislike') ? '#4B5563' : '#000'
                    }}
                  >
                    <Skull size={14} fill={chatData.user_reactions?.includes('dislike') ? "#4B5563" : "transparent"} stroke={chatData.user_reactions?.includes('dislike') ? "#fff" : "#000"} strokeWidth={2} /> {chatData.dislikes}
                  </div>
                  <div 
                    className={`reaction-pill ${chatData.user_reactions?.includes('cap') ? 'active' : ''}`}
                    onClick={() => handleReaction('cap')}
                    style={{ 
                      cursor: 'pointer',
                      background: chatData.user_reactions?.includes('cap') ? 'rgba(255, 75, 92, 0.1)' : '#fff',
                      borderColor: chatData.user_reactions?.includes('cap') ? '#FF4B5C' : '#000',
                      borderWidth: '2px',
                      color: chatData.user_reactions?.includes('cap') ? '#FF4B5C' : '#000'
                    }}
                  >
                    <Heart size={14} fill={chatData.user_reactions?.includes('cap') ? "#FF4B5C" : "transparent"} stroke={chatData.user_reactions?.includes('cap') ? "#fff" : "#000"} strokeWidth={2} /> {chatData.caps}
                  </div>
                  <div 
                    className={`reaction-pill ${chatData.user_reactions?.includes('smile') ? 'active' : ''}`}
                    onClick={() => handleReaction('smile')}
                    style={{ 
                      cursor: 'pointer',
                      background: chatData.user_reactions?.includes('smile') ? 'rgba(245, 158, 11, 0.1)' : '#fff',
                      borderColor: chatData.user_reactions?.includes('smile') ? '#F59E0B' : '#000',
                      borderWidth: '2px',
                      color: chatData.user_reactions?.includes('smile') ? '#F59E0B' : '#000'
                    }}
                  >
                    <Laugh size={14} fill={chatData.user_reactions?.includes('smile') ? "#F59E0B" : "transparent"} stroke={chatData.user_reactions?.includes('smile') ? "#fff" : "#000"} strokeWidth={2} /> {chatData.smiles}
                  </div>
                </div>
                <div className="chat-views-info">
                  <Eye size={14} /> {chatData.views} &nbsp; <Users size={14} /> {chatData.watching} watching
                </div>
              </div>

            </div>

            {/* Right sidebar */}
            <ProfileSidebar participant={p2} otherChats={chatData.otherChats.right} 
              messageCount={p2MsgCount} currentUser={currentUser} />
          </div>

          {/* Responsive Profile Drawer Modal */}
          <AnimatePresence>
            {selectedProfileModal && (
              <motion.div 
                className="brutalist-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProfileModal(null)}
              >
                <motion.div 
                  className="brutalist-modal-content"
                  onClick={(e) => e.stopPropagation()}
                  initial={{ scale: 0.95, y: 15 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.95, y: 15 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 250 }}
                >
                  <button 
                    className="brutalist-close-btn"
                    onClick={() => setSelectedProfileModal(null)}
                  >
                    ✕
                  </button>
                  <ProfileSidebar 
                    participant={selectedProfileModal === 'left' ? p1 : p2} 
                    otherChats={selectedProfileModal === 'left' ? chatData.otherChats.left : chatData.otherChats.right}
                    messageCount={selectedProfileModal === 'left' ? p1MsgCount : p2MsgCount}
                    currentUser={currentUser}
                  />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>

      <NavigationArrows onNext={goNext} onPrev={goPrev} />
    </div>
  );
};


const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login/', { username, password });
            localStorage.setItem('access', response.data.tokens.access);
            localStorage.setItem('refresh', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid username or password');
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            const response = await axios.post('/api/auth/google/', { token: tokenResponse.access_token });
            localStorage.setItem('access', response.data.tokens.access);
            localStorage.setItem('refresh', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError('Google Login failed. Please try again or use standard login.');
            console.error('Google Auth Error:', err);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Login Failed')
    });

    return (
        <div className="auth-container">
            <Header />
            <div className="auth-card">
                <div className="auth-header">
                    <h2>LOGIN<span>.</span></h2>
                    <p>Enter the void.</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-group">
                        <label>USERNAME</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="neo_driver"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>PASSWORD</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">ACCESS SYSTEM</button>
                </form>
                <div className="auth-divider">OR</div>
                <button type="button" onClick={() => loginWithGoogle()} className="google-button">
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    CONTINUE WITH GOOGLE
                </button>
                <div className="auth-footer">
                    New here? <Link to="/register">Register Identity</Link>
                </div>
            </div>
        </div>
    );
};

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/register/', { username, password, email });
            localStorage.setItem('access', response.data.tokens.access);
            localStorage.setItem('refresh', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            const detail = err.response?.data;
            setError(detail?.username?.[0] || detail?.email?.[0] || detail?.password?.[0] || 'Registration failed');
        }
    };

    const handleGoogleSuccess = async (tokenResponse) => {
        try {
            const response = await axios.post('/api/auth/google/', { token: tokenResponse.access_token });
            localStorage.setItem('access', response.data.tokens.access);
            localStorage.setItem('refresh', response.data.tokens.refresh);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate('/');
        } catch (err) {
            setError('Google Login failed. Please try again or use standard register.');
            console.error('Google Auth Error:', err);
        }
    };

    const loginWithGoogle = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => setError('Google Login Failed')
    });

    return (
        <div className="auth-container">
            <Header />
            <div className="auth-card">
                <div className="auth-header">
                    <h2>REGISTER<span>.</span></h2>
                    <p>Join the network.</p>
                </div>
                {error && <div className="auth-error">{error}</div>}
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="input-group">
                        <label>USERNAME</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="neo_driver"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>EMAIL</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="neo@wave.net"
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label>PASSWORD</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="********"
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button">INITIALIZE IDENTITY</button>
                </form>
                <div className="auth-divider">OR</div>
                <button type="button" onClick={() => loginWithGoogle()} className="google-button">
                    <svg className="google-icon" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    CONTINUE WITH GOOGLE
                </button>
                <div className="auth-footer">
                    Already registered? <Link to="/login">Access System</Link>
                </div>
            </div>
        </div>
    );
};

const MessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    
    // Inline chat state
    const [activeChatId, setActiveChatId] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [chatMessages, setChatMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [floatingReactions, setFloatingReactions] = useState([]);
    const messagesEndRef = useRef(null);
    
    const navigate = useNavigate();
    const searchTimeoutRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [emojiSearchQuery, setEmojiSearchQuery] = useState('');
    const [onlineStatus, setOnlineStatus] = useState('ONLINE');
    const [clock, setClock] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setClock(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const commonEmojis = ['😂', '❤️', '🔥', '💀', '👍', '🙏', '💯', '✨', '🙌', '😮', '😢', '😍', '👏', '💔', '🤔'];

    const handleLogout = () => {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleEmojiSelect = (emoji) => {
        setMessageInput(prev => prev + emoji);
    };

    const uploadFile = async (e) => {
        const file = e.target.files[0];
        if (!file || !activeChatId) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('attachment', file);
        formData.append('conversation', activeChatId);
        formData.append('text', file.name);

        let type = 'file';
        if (file.type.startsWith('image/')) type = 'image';
        else if (file.type.startsWith('audio/')) type = 'audio';
        formData.append('message_type', type);

        try {
            const token = localStorage.getItem('access');
            const res = await axios.post('/api/messages/', formData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'send_message',
                    text: file.name,
                    chatId: activeChatId,
                    message_type: type,
                    attachment: res.data.attachment
                }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
            alert("File upload failed.");
        } finally {
            setUploading(false);
        }
    };

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const token = localStorage.getItem('access');
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchConversations = async () => {
            try {
                const token = localStorage.getItem('access');
                const response = await axios.get('/api/conversations/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const convs = response.data.results || response.data;
                setConversations(convs);

                // Calculate unread status locally
                const unreads = {};
                convs.forEach(conv => {
                    const lastMsg = conv.last_message;
                    // If last message exists, is NOT from current user, and is NOT read
                    if (lastMsg && lastMsg.sender !== currentUser.id && !lastMsg.is_read) {
                        unreads[conv.id] = true;
                    }
                });
                setUnreadCounts(unreads);
            } catch (err) {
                console.error('Failed to fetch conversations:', err);
                if (err.response?.status === 401) {
                    localStorage.removeItem('access');
                    localStorage.removeItem('refresh');
                    localStorage.removeItem('user');
                    navigate('/login');
                } else {
                    setFetchError('Could not load conversations.');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchConversations();
    }, [navigate]);

    // Fetch messages & connect WS when activeChatId changes
    useEffect(() => {
        if (!activeChatId) return;

        const token = localStorage.getItem('access');
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`/api/conversations/${activeChatId}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setChatMessages(response.data.messages || []);
                setTimeout(() => messagesEndRef.current?.scrollIntoView(), 100);
                
                // Mark as read
                setUnreadCounts(prev => ({ ...prev, [activeChatId]: false }));
            } catch (err) {
                console.error("Failed to fetch active chat messages", err);
            }
        };
        fetchMessages();

        const wsBaseUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';
        const ws = new WebSocket(`${wsBaseUrl}/ws/chat/${activeChatId}/`);
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'receive_message') {
                setChatMessages(prev => [...prev, {
                    sender: { username: data.senderId },
                    text: data.text,
                    timestamp: new Date().toISOString()
                }]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        };
        setSocket(ws);
        
        return () => ws.close();
    }, [activeChatId]);

    const handleSelectChat = async (id) => {
        setActiveChatId(id);
        const token = localStorage.getItem('access');
        try {
            await axios.post(`/api/conversations/${id}/mark-read/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Update local state instantly
            setUnreadCounts(prev => ({ ...prev, [id]: false }));
            setConversations(prev => prev.map(conv => 
                conv.id === id ? { ...conv, last_message: { ...conv.last_message, is_read: true } } : conv
            ));
        } catch (err) {
            console.error('Failed to mark chat as read', err);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageInput.trim() || !activeChatId) return;

        const text = messageInput;
        setMessageInput('');
        const token = localStorage.getItem('access');

        try {
            const response = await axios.post('/api/messages/send/', {
                conversation_id: activeChatId,
                text: text
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // If WS is open, broadcast to other user
            if (socket && socket.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({
                    type: 'send_message',
                    senderId: currentUser.username,
                    text: text
                }));
            } else {
                setChatMessages(prev => [...prev, response.data]);
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
            }
        } catch (err) {
            console.error('Failed to send message', err);
            setMessageInput(text); // restore input if failed
        }
    };

    const handleSearchChange = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        if (!q.trim()) {
            setUserResults([]);
            setShowDropdown(false);
            return;
        }
        setSearching(true);
        setShowDropdown(true);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('access');
                const res = await axios.get(`/api/search/users/?q=${encodeURIComponent(q)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUserResults(res.data);
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setSearching(false);
            }
        }, 350);
    };

    const startChat = async (username) => {
        try {
            const token = localStorage.getItem('access');
            const res = await axios.post('/api/conversations/create/', { username }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const convoId = res.data.id;
            setSearchQuery('');
            setUserResults([]);
            setShowDropdown(false);
            
            // Add to conversations list if new
            setConversations(prev => {
                if (!prev.find(c => c.id === convoId)) {
                    return [res.data, ...prev];
                }
                return prev;
            });
            
            setActiveChatId(convoId);
        } catch (err) {
            console.error('Failed to start chat:', err);
        }
    };

    const toggleVisibility = async (e, convoId) => {
        e.stopPropagation();
        try {
            const token = localStorage.getItem('access');
            const res = await axios.post(`/api/conversations/${convoId}/toggle-visibility/`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConversations(prev => prev.map(c => 
                c.id === convoId ? { ...c, is_public: res.data.is_public } : c
            ));
        } catch (err) {
            console.error('Failed to toggle visibility:', err);
        }
    };

    const filtered = searchQuery
        ? conversations.filter(c => {
            const name = c.other_participant?.username || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase());
          })
        : conversations;

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        const now = new Date();
        const diff = now - d;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg-color)' }}>
            <Header />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                {/* Floating Horizontal Chatter Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.75rem 1.25rem',
                    background: 'transparent',
                    overflowX: 'auto',
                    gap: '0.5rem',
                    flexShrink: 0
                }}>
                    {loading ? (
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.5 }}>LOADING...</div>
                    ) : (
                        filtered.map((convo) => {
                            const other = convo.other_participant;
                            const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.username || 'anon'}`;
                            const isUnread = unreadCounts[convo.id];
                            const isActive = activeChatId === convo.id;
                            return (
                                <div 
                                    key={convo.id} 
                                    onClick={() => handleSelectChat(convo.id)} 
                                    style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.5rem', 
                                        padding: '0.4rem 0.85rem', 
                                        border: isActive ? '2px solid #000' : '2px solid #e0e0e0', 
                                        background: isActive ? '#000' : '#fff',
                                        color: isActive ? '#fff' : '#000',
                                        cursor: 'pointer',
                                        minWidth: 'fit-content',
                                        position: 'relative',
                                        boxShadow: isActive ? '3px 3px 0 var(--accent-color)' : 'none',
                                        transition: 'all 0.1s ease'
                                    }}
                                    title={convo.last_message?.text || 'No messages'}
                                >
                                    <div style={{ position: 'relative', width: '28px', height: '28px', border: isActive ? '2px solid #fff' : '2px solid #000', overflow: 'hidden', flexShrink: 0 }}>
                                        <img src={avatarUrl} alt={other?.username} style={{ width: '100%', height: '100%' }} />
                                        {isUnread && (
                                            <div style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, background: 'var(--accent-color)', border: '1px solid #000', borderRadius: '50%' }} />
                                        )}
                                    </div>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700 }}>{other?.username || 'Unknown'}</span>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Main Chat Area */}
                <div className="messages-main-area">
                    <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', background: '#fff', border: '3px solid #000', boxShadow: '6px 6px 0 #000', position: 'relative', overflow: 'hidden' }}>
                    {!activeChatId ? (
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5 }}>
                            <MessageCircle size={48} style={{ marginBottom: '1rem' }} />
                            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>SELECT A TRANSMISSION TO BEGIN</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                                {/* Messages */}
                                <div className="chat-messages-list" style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                                    {chatMessages.map((msg, idx) => {
                                        const senderName = msg.sender?.username || msg.sender_username || 'ANON';
                                        const isMe = currentUser && senderName.toUpperCase() === currentUser.username?.toUpperCase();
                                        return (
                                            <motion.div
                                                key={idx}
                                                className="chat-message-row"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.03 * idx, duration: 0.2 }}
                                            >
                                                <div className="chat-msg-container">
                                                    <div className="chat-msg-line">
                                                        <span className="chat-msg-sender" style={{ color: isMe ? 'var(--accent-color)' : '#000' }}>
                                                            {isMe ? 'YOU' : senderName.toUpperCase()}:
                                                        </span>
                                                        {msg.message_type === 'image' ? (
                                                            <img src={msg.attachment} alt="shared" style={{ maxWidth: '100%', maxHeight: 260, border: '3px solid #000', boxShadow: '4px 4px 0 #000', marginTop: 8, display: 'block' }} />
                                                        ) : msg.message_type === 'audio' ? (
                                                            <audio controls src={msg.attachment} style={{ width: '100%', marginTop: 8 }} />
                                                        ) : (
                                                            <span className="chat-msg-text">{msg.text}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div style={{ padding: '0.75rem', borderTop: '3px solid #000', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={uploadFile} accept="image/*,audio/*" />
                                    <button onClick={() => fileInputRef.current.click()} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Plus size={20} /></button>
                                    <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Laugh size={20} color={showEmojiPicker ? 'var(--accent-color)' : '#666'} /></button>
                                    <input 
                                        type="text" 
                                        value={messageInput} 
                                        onChange={(e) => setMessageInput(e.target.value)} 
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(e)} 
                                        placeholder="Type your message..." 
                                        style={{ flex: 1, padding: '0.6rem 0.75rem', border: '2px solid #000', fontFamily: 'var(--font-mono)' }} 
                                    />
                                    <button onClick={handleSendMessage} style={{ padding: '0.6rem 1rem', background: '#000', color: '#fff', border: '2px solid #000', cursor: 'pointer' }}><Send size={18} /></button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div 
                                        initial={{ x: '100%' }} 
                                        animate={{ x: 0 }} 
                                        exit={{ x: '100%' }} 
                                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                        style={{ width: '320px', height: '100%', background: '#fff', borderLeft: '4px solid #000', display: 'flex', flexDirection: 'column', zIndex: 20 }}
                                    >
                                        <div style={{ padding: '1rem', borderBottom: '3px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#000', color: '#fff' }}>
                                            <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', fontWeight: 900, letterSpacing: '1px' }}>EMOJIS</h3>
                                            <button onClick={() => setShowEmojiPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}><X size={18} /></button>
                                        </div>
                                        
                                        {/* Emoji Search Input */}
                                        <div style={{ padding: '12px', borderBottom: '3px solid #000', background: '#f5f5f5' }}>
                                            <input 
                                                type="text" 
                                                placeholder="SEARCH EMOJIS..."
                                                value={emojiSearchQuery}
                                                onChange={(e) => setEmojiSearchQuery(e.target.value.toLowerCase())}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px 12px',
                                                    border: '3px solid #000',
                                                    fontFamily: 'var(--font-mono)',
                                                    fontSize: '0.75rem',
                                                    background: '#fff',
                                                    outline: 'none',
                                                    boxShadow: '3px 3px 0 #000'
                                                }}
                                            />
                                        </div>

                                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
                                                {EMOJI_DATA.filter(e => e.tags.includes(emojiSearchQuery) || e.char.includes(emojiSearchQuery)).map((e, idx) => (
                                                    <button 
                                                        key={idx} 
                                                        onClick={() => handleEmojiSelect(e.char)} 
                                                        style={{ background: 'none', border: '1px solid #eee', fontSize: '22px', cursor: 'pointer', padding: '8px', borderRadius: '4px' }}
                                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#000'}
                                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#eee'}
                                                    >
                                                        {e.char}
                                                    </button>
                                                ))}
                                            </div>
                                            {EMOJI_DATA.filter(e => e.tags.includes(emojiSearchQuery) || e.char.includes(emojiSearchQuery)).length === 0 && (
                                                <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: '#888' }}>
                                                    NO MATCHES FOUND
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
                </div>
            </div>

            {/* Footer */}
            <div className="messages-footer">
                {/* Avatar + username */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ width: '32px', height: '32px', border: '2px solid var(--accent-color)', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username || 'anon'}`} alt="me" style={{ width: '100%', height: '100%' }} />
                        </div>
                        {/* Status dot */}
                        <div style={{
                            position: 'absolute', bottom: -2, right: -2,
                            width: 10, height: 10, borderRadius: '50%',
                            background: onlineStatus === 'ONLINE' ? '#22c55e' : onlineStatus === 'AWAY' ? '#f59e0b' : '#6b7280',
                            border: '2px solid #000'
                        }} />
                    </div>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px' }}>
                            {currentUser?.username?.toUpperCase() || 'GUEST'}
                        </div>
                        {/* Status toggle */}
                        <div style={{ display: 'flex', gap: '0.3rem', marginTop: '2px' }}>
                            {['ONLINE', 'AWAY', 'OFFLINE'].map(s => (
                                <span
                                    key={s}
                                    onClick={() => setOnlineStatus(s)}
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.55rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        color: onlineStatus === s ? (s === 'ONLINE' ? '#22c55e' : s === 'AWAY' ? '#f59e0b' : '#9ca3af') : '#555',
                                        letterSpacing: '0.5px'
                                    }}
                                >{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ width: '2px', height: '28px', background: '#222', flexShrink: 0 }} />

                {/* Search to start new chat */}
                <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="NEW CHAT — search a user..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onFocus={() => searchQuery && setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        style={{
                            width: '100%',
                            padding: '0.4rem 0.75rem',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.7rem',
                            background: '#1a1a1a',
                            color: '#fff',
                            border: '2px solid #333',
                            outline: 'none',
                        }}
                    />
                    {showDropdown && (
                        <div style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', background: '#fff', border: '2px solid #000', zIndex: 100, maxHeight: '200px', overflowY: 'auto', boxShadow: '0 -4px 0 #000' }}>
                            {searching ? (
                                <div style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Searching...</div>
                            ) : (
                                userResults.map(u => (
                                    <div key={u.id} onMouseDown={() => startChat(u.username)} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.85rem', cursor: 'pointer', borderBottom: '1px solid #f0f0f0' }}>
                                        <div style={{ width: '28px', height: '28px', border: '2px solid #000', overflow: 'hidden' }}>
                                            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} alt={u.username} style={{ width: '100%', height: '100%' }} />
                                        </div>
                                        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 700, color: '#000' }}>{u.username}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Unread badge */}
                {Object.values(unreadCounts).filter(Boolean).length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Bell size={14} color="#f59e0b" />
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 900, color: '#f59e0b' }}>
                            {Object.values(unreadCounts).filter(Boolean).length} UNREAD
                        </span>
                    </div>
                )}

                {/* Live clock */}
                <div className="footer-clock" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#666' }}>
                    <Clock size={13} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', fontWeight: 700 }}>
                        {clock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {/* Divider */}
                <div style={{ width: '2px', height: '28px', background: '#222', flexShrink: 0 }} />

                {/* Settings */}
                <button
                    title="SETTINGS"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', padding: '0.35rem' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = '#888'}
                >
                    <Settings size={17} />
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title="LOGOUT"
                    style={{ background: 'none', border: '2px solid #333', cursor: 'pointer', color: '#FF4B5C', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 700 }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#FF4B5C'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#333'}
                >
                    <LogOut size={16} /> <span className="footer-logout-btn-text">LOGOUT</span>
                </button>
            </div>
        </div>
    );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
