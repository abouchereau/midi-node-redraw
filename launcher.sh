#!/bin/bash

gnome-terminal -- bash -c "node $(dirname $(readlink -f $0))/HIDControlCustom.js"