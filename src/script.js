/* eslint-disable max-statements */
(function () {
    // dayjsのロケール設定
    dayjs.locale('ja');

    // コース毎の元気コストの設定
    const staminaCost = {
        _2m_live3: 15 * 3,
        _2m_live2: 15 * 3,
        _2m_live: 15 * 3,
        _2m_work: 15 * 3,
        _4m_live3: 20 * 3,
        _4m_live2: 20 * 3,
        _4m_live: 20 * 3,
        _4m_work: 20 * 3,
        _6m_live3: 25 * 3,
        _6m_live2: 25 * 3,
        _6m_live: 25 * 3,
        _6m_work: 25 * 3,
        _mm_live3: 30 * 3,
        _mm_live2: 30 * 3,
        _mm_live: 30 * 3,
        _mm_work: 30 * 3,
    };

    // コース毎の獲得ptの設定
    const points = {
        _2m_live3: 142 + 142 + 142,
        _2m_live2: 142 + 142 + 50,
        _2m_live: 142 + 50 + 50,
        _2m_work: 50 + 50 + 50,
        _4m_live3: 161 + 161 + 161,
        _4m_live2: 161 + 161 + 57,
        _4m_live: 161 + 57 + 57,
        _4m_work: 57 + 57 + 57,
        _6m_live3: 180 + 180 + 180,
        _6m_live2: 180 + 180 + 74,
        _6m_live: 180 + 74 + 74,
        _6m_work: 74 + 74 + 74,
        _mm_live3: 200 + 200 + 200,
        _mm_live2: 200 + 200 + 82,
        _mm_live: 200 + 82 + 82,
        _mm_work: 82 + 82 + 82,
    };

    // コース毎の獲得ゲージの設定
    const gauges = {
        _2m_live3: 20,
        _2m_live2: 20,
        _2m_live: 20,
        _2m_work: 20,
        _4m_live3: 30,
        _4m_live2: 30,
        _4m_live: 30,
        _4m_work: 30,
        _6m_live3: 40,
        _6m_live2: 40,
        _6m_live: 40,
        _6m_work: 40,
        _mm_live3: 50,
        _mm_live2: 50,
        _mm_live: 50,
        _mm_work: 50,
    };

    // コース毎の所要時間の設定
    const minutes = {
        _2m_live3: 3 + 3 + 3,
        _2m_live2: 3 + 3 + 0.5,
        _2m_live: 3 + 0.5 + 0.5,
        _2m_work: 0.5 + 0.5 + 0.5,
        _4m_live3: 3 + 3 + 3,
        _4m_live2: 3 + 3 + 0.5,
        _4m_live: 3 + 0.5 + 0.5,
        _4m_work: 0.5 + 0.5 + 0.5,
        _6m_live3: 3 + 3 + 3,
        _6m_live2: 3 + 3 + 0.5,
        _6m_live: 3 + 0.5 + 0.5,
        _6m_work: 0.5 + 0.5 + 0.5,
        _mm_live3: 3 + 3 + 3,
        _mm_live2: 3 + 3 + 0.5,
        _mm_live: 3 + 0.5 + 0.5,
        _mm_work: 0.5 + 0.5 + 0.5,
    };

    // イベントステージの設定
    const eventStaminaCost = 20;
    const eventPoints = 3000;
    const eventMinutes = 3;

    // 入力値の取得
    function getFormValue() {
        const formValue = {};
        const errors = [];

        if ($('#isNow').prop('checked')) {
            $('#datetimeNow').val(dayjs().format('YYYY-MM-DDTHH:mm'));
        }

        function validDateTime(field) {
            const inputValue = $(`#${field}`).val();
            if (!inputValue) {
                errors.push({
                    field: field,
                    message: '必須です。',
                });
            } else if (!dayjs(inputValue).isValid()) {
                errors.push({
                    field: field,
                    message: '日時の入力例は「2017-06-29T15:00」です。',
                });
            } else {
                formValue[field] = inputValue;
                formValue[`${field}Unix`] = dayjs(inputValue).unix();
            }
        }
        validDateTime('datetimeStart');
        validDateTime('datetimeEnd');
        validDateTime('datetimeNow');

        if (formValue.datetimeNowUnix < formValue.datetimeStartUnix) {
            formValue.datetimeNowUnix = formValue.datetimeStartUnix;
            formValue.isFuture = true;
        }
        if (formValue.datetimeNowUnix > formValue.datetimeEndUnix) {
            formValue.datetimeNowUnix = formValue.datetimeEndUnix;
        }

        formValue.endOfTodayUnix = dayjs(formValue.datetimeNow).endOf('d').unix();
        if (formValue.endOfTodayUnix < formValue.datetimeStartUnix) {
            formValue.endOfTodayUnix = formValue.datetimeStartUnix;
        }
        if (formValue.endOfTodayUnix > formValue.datetimeEndUnix) {
            formValue.endOfTodayUnix = formValue.datetimeEndUnix;
        }

        function validSafeInteger(field) {
            const inputValue = $(`#${field}`).val();
            if (!inputValue) {
                errors.push({
                    field: field,
                    message: '必須です。',
                });
            } else if (!Number.isSafeInteger(Number(inputValue))) {
                errors.push({
                    field: field,
                    message: '有効な値ではありません。',
                });
            } else {
                formValue[field] = Number(inputValue);
            }
        }
        validSafeInteger('targetEnd');
        validSafeInteger('stamina');
        validSafeInteger('myPoint');
        validSafeInteger('gauge');
        validSafeInteger('kizuna');
        validSafeInteger('mission');
        validSafeInteger('missionKizuna');

        formValue.showCourse = $('[name="showCourse"]:checked')
            .map((i) => {
                return $('[name="showCourse"]:checked').eq(i).val();
            })
            .get();
        formValue.isAutoSave = $('#autoSave').prop('checked');

        $('.error').remove();
        if (errors.length) {
            errors.forEach((error) => {
                $(`#${error.field}`).after(`<span class="error">${error.message}</span>`);
            });
            return null;
        }
        return formValue;
    }

    // 目標ポイントを計算
    function calculateTargetPoint(formValue) {
        let diffEnd = formValue.targetEnd - formValue.myPoint;
        if (diffEnd < 0) {
            diffEnd = 0;
        }
        $('#diffEnd').text(`(あと ${diffEnd.toLocaleString()} pt)`);

        $('#labelToday').text(`【${dayjs.unix(formValue.endOfTodayUnix).format('M/D')}の目標】`);

        const targetToday = Math.round(
            (formValue.targetEnd * (formValue.endOfTodayUnix - formValue.datetimeStartUnix)) /
                (formValue.datetimeEndUnix - formValue.datetimeStartUnix)
        );
        let diffToday = targetToday - formValue.myPoint;
        if (diffToday < 0) {
            diffToday = 0;
        }
        $('#targetToday').text(`${targetToday.toLocaleString()} pt (あと ${diffToday.toLocaleString()} pt)`);

        $('#labelNow').text(`【${dayjs.unix(formValue.datetimeNowUnix).format('M/D H:mm')}の目標】`);

        const targetNow = Math.round(
            (formValue.targetEnd * (formValue.datetimeNowUnix - formValue.datetimeStartUnix)) /
                (formValue.datetimeEndUnix - formValue.datetimeStartUnix)
        );
        let diffNow = targetNow - formValue.myPoint;
        if (diffNow < 0) {
            diffNow = 0;
        }
        $('#targetNow').text(`${targetNow.toLocaleString()} pt (あと ${diffNow.toLocaleString()} pt)`);
    }

    function isGetKizuna(beforePoint, getPoint) {
        if (beforePoint < 30000 && beforePoint + getPoint >= 30000) {
            return true;
        }
        if (beforePoint < 35000 && beforePoint + getPoint >= 35000) {
            return true;
        }
        if (beforePoint < 40000 && beforePoint + getPoint >= 40000) {
            return true;
        }
        if (beforePoint < 45000 && beforePoint + getPoint >= 45000) {
            return true;
        }
        return false;
    }
    function isLoseKizuna(beforePoint, losePoint) {
        if (beforePoint >= 30000 && beforePoint - losePoint < 30000) {
            return true;
        }
        if (beforePoint >= 35000 && beforePoint - losePoint < 35000) {
            return true;
        }
        if (beforePoint >= 40000 && beforePoint - losePoint < 40000) {
            return true;
        }
        if (beforePoint >= 45000 && beforePoint - losePoint < 45000) {
            return true;
        }
        return false;
    }

    // コース毎の計算
    function calculateByCouse(course, formValue, result, minCost) {
        if (formValue.showCourse.length && formValue.showCourse.indexOf(course) === -1) {
            // 表示コースでなければ計算しない
            return;
        }

        const isWork = course.indexOf('work') !== -1;

        let gauge = formValue.gauge;
        let kizuna = formValue.kizuna + formValue.missionKizuna;

        let promotionTimes = 0;
        let promotionEarnedPoint = 0;

        let eventStageTimes = 0;
        let eventEarnedPoint = 0;

        let eventLiveTimes = 0;
        let consumedStamina = 0;

        // プロモーション回数、イベントステージ回数を計算
        while (formValue.targetEnd > formValue.myPoint + promotionEarnedPoint + eventEarnedPoint || formValue.mission > eventLiveTimes) {
            // 累積ptが最終目標pt未満、イベント楽曲回数がミッション未満なら繰り返し
            if (kizuna >= 1) {
                // チームの絆を使う
                kizuna--;
                gauge += 100;
            }
            if (gauge >= 100) {
                // ゲージが100%以上ならイベントステージ
                gauge -= 100;
                eventStageTimes++;
                eventLiveTimes++;
                if (isGetKizuna(formValue.myPoint + promotionEarnedPoint + eventEarnedPoint, eventPoints)) {
                    kizuna++;
                }
                eventEarnedPoint += eventPoints;
                consumedStamina += eventStaminaCost;
            } else {
                // ゲージが100%未満ならプロモーション
                gauge += gauges[course];
                promotionTimes++;
                if (!isWork) {
                    eventLiveTimes++;
                }
                if (isGetKizuna(formValue.myPoint + promotionEarnedPoint + eventEarnedPoint, points[course])) {
                    kizuna++;
                }
                promotionEarnedPoint += points[course];
                consumedStamina += staminaCost[course];
            }
        }

        // 自然回復日時の計算
        const naturalRecoveryUnix = dayjs
            .unix(formValue.datetimeNowUnix)
            .add((consumedStamina - formValue.stamina) * 5, 'm')
            .unix();

        // 要回復元気の計算
        let requiredRecoveryStamina = 0;
        if (naturalRecoveryUnix > formValue.datetimeEndUnix) {
            requiredRecoveryStamina = Math.ceil((naturalRecoveryUnix - formValue.datetimeEndUnix) / 60 / 5);
        }

        // 所要時間の計算
        const requiredMinutes = minutes[course] * Math.ceil(promotionTimes) + eventMinutes * eventStageTimes;

        // 計算結果を格納
        result[course] = {};

        result[course].promotionTimes = promotionTimes;
        result[course].promotionEarnedPoint = promotionEarnedPoint;

        result[course].eventTimes = eventStageTimes;
        result[course].eventEarnedPoint = eventEarnedPoint;

        result[course].consumedStamina = consumedStamina;
        result[course].naturalRecoveryUnix = naturalRecoveryUnix;
        result[course].requiredRecoveryStamina = requiredRecoveryStamina;
        result[course].requiredMinutes = requiredMinutes;
        result[course].requiredTime = '';
        if (Math.floor(requiredMinutes / 60)) {
            result[course].requiredTime += `${Math.floor(requiredMinutes / 60)}時間`;
        }
        if (Math.ceil(requiredMinutes % 60)) {
            result[course].requiredTime += `${Math.ceil(requiredMinutes % 60)}分`;
        }
        if (!result[course].requiredTime) {
            result[course].requiredTime += '0分';
        }

        // 消費元気、要回復元気、所要時間の最小値を格納
        if (minCost.consumedStamina === undefined || minCost.consumedStamina > consumedStamina) {
            minCost.consumedStamina = consumedStamina;
        }
        if (minCost.requiredRecoveryStamina === undefined || minCost.requiredRecoveryStamina > requiredRecoveryStamina) {
            minCost.requiredRecoveryStamina = requiredRecoveryStamina;
        }
        if (minCost.requiredMinutes === undefined || minCost.requiredMinutes > requiredMinutes) {
            minCost.requiredMinutes = requiredMinutes;
        }
    }

    // 計算結果の表示
    function showResultByCouse(course, formValue, minResult, minCost) {
        const level = course.slice(0, 3);
        if (formValue.showCourse.length && formValue.showCourse.indexOf(course) === -1) {
            // 表示コースでなければ列を非表示
            $(`.${course}`).hide();
            const colspan = $(`.${level}_header`).prop('colspan');
            if (colspan > 1) {
                $(`.${level}_header`).prop('colspan', colspan - 1);
            } else {
                $(`.${level}_header`).hide();
            }
            return;
        }
        $(`.${course}`).show();
        $(`.${level}_header`).show();

        function showResultText(field, minValue, unit, isLink) {
            let text = minValue;
            if (isLink) {
                text = `<a href="../event-jewels-calculator/index.html?datetimeStart=${formValue.datetimeStart}&datetimeEnd=${
                    formValue.datetimeEnd
                }&consumedStamina=${minValue}&stamina=${formValue.stamina}">${minValue.toLocaleString()}</a>`;
            }
            if (unit) {
                text += ` ${unit}`;
            }
            $(`#${field}${course}`).html(text);
        }
        showResultText('promotionTimes', minResult[course].promotionTimes.toLocaleString());
        showResultText('promotionEarnedPoint', minResult[course].promotionEarnedPoint.toLocaleString(), 'pt');

        showResultText('eventTimes', minResult[course].eventTimes.toLocaleString());
        showResultText('eventEarnedPoint', minResult[course].eventEarnedPoint.toLocaleString(), 'pt');

        showResultText('consumedStamina', minResult[course].consumedStamina, false, true);
        showResultText('naturalRecoveryAt', dayjs.unix(minResult[course].naturalRecoveryUnix).format('M/D H:mm'));
        showResultText('requiredRecoveryStamina', minResult[course].requiredRecoveryStamina.toLocaleString());
        showResultText('requiredTime', minResult[course].requiredTime);

        // 消費元気、要回復元気、所要時間の最小値は青文字
        if (formValue.showCourse.length !== 1 && minResult[course].consumedStamina === minCost.consumedStamina) {
            $(`#consumedStamina${course}`).addClass('info');
        } else {
            $(`#consumedStamina${course}`).removeClass('info');
        }
        if (formValue.showCourse.length !== 1 && minResult[course].requiredRecoveryStamina === minCost.requiredRecoveryStamina) {
            $(`#requiredRecoveryStamina${course}`).addClass('info');
        } else {
            $(`#requiredRecoveryStamina${course}`).removeClass('info');
        }
        if (formValue.showCourse.length !== 1 && minResult[course].requiredMinutes === minCost.requiredMinutes) {
            $(`#requiredTime${course}`).addClass('info');
        } else {
            $(`#requiredTime${course}`).removeClass('info');
        }

        // 開催期限をオーバーする場合、赤文字
        if (minResult[course].naturalRecoveryUnix > formValue.datetimeEndUnix) {
            $(`#naturalRecoveryAt${course}`).addClass('danger');
        } else {
            $(`#naturalRecoveryAt${course}`).removeClass('danger');
        }
        if (dayjs.unix(formValue.datetimeNowUnix).add(minResult[course].requiredMinutes, 'm').unix() > formValue.datetimeEndUnix) {
            $(`#requiredTime${course}`).addClass('danger');
        } else {
            $(`#requiredTime${course}`).removeClass('danger');
        }
    }

    // チームの計算
    function calculateTeam(formValue) {
        const result = {};
        const minCost = {};

        // 計算
        Object.keys(staminaCost).forEach((course) => {
            calculateByCouse(course, formValue, result, minCost);
        });

        // 表示
        $('._2m_header').prop('colspan', 4);
        $('._4m_header').prop('colspan', 4);
        $('._6m_header').prop('colspan', 4);
        $('._mm_header').prop('colspan', 4);
        Object.keys(staminaCost).forEach((course) => {
            showResultByCouse(course, formValue, result, minCost);
        });
    }

    function save() {
        const datetimeSave = dayjs().format('YYYY/M/D H:mm');

        const saveData = {
            datetimeStart: $('#datetimeStart').val(),
            datetimeEnd: $('#datetimeEnd').val(),
            datetimeNow: $('#datetimeNow').val(),
            isNow: $('#isNow').prop('checked'),
            targetEnd: $('#targetEnd').val(),
            stamina: $('#stamina').val(),
            myPoint: $('#myPoint').val(),
            gauge: $('#gauge').val(),
            kizuna: $('#kizuna').val(),
            mission: $('#mission').val(),
            missionKizuna: $('#missionKizuna').val(),
            showCourse: $('[name="showCourse"]:checked')
                .map((i) => {
                    return $('[name="showCourse"]:checked').eq(i).val();
                })
                .get(),
            autoSave: $('#autoSave').prop('checked'),
            datetimeSave: datetimeSave,
        };

        localStorage.setItem(location.href.replace('index.html', ''), JSON.stringify(saveData));

        $('#datetimeSave').text(datetimeSave);
        $('#loadSave').prop('disabled', false);
        $('#clearSave').prop('disabled', false);
    }

    function toggleDisabledButton(formValue) {
        Object.keys(staminaCost).forEach((course) => {
            if (formValue.gauge >= gauges[course]) {
                $(`.beforePlayPromotion[value="${course}"]`).prop('disabled', false);
                $(`.beforePlayEvent[value="${course}"]`).prop('disabled', true);
            } else {
                $(`.beforePlayPromotion[value="${course}"]`).prop('disabled', true);
                $(`.beforePlayEvent[value="${course}"]`).prop('disabled', false);
            }
        });
        if (formValue.gauge >= 100) {
            $('.afterPlayPromotion').prop('disabled', true);
            $('.afterPlayEvent').prop('disabled', false);
        } else {
            $('.afterPlayPromotion').prop('disabled', false);
            $('.afterPlayEvent').prop('disabled', true);
        }
    }

    function calculate() {
        const formValue = getFormValue();
        calculateTargetPoint(formValue);
        calculateTeam(formValue);
        toggleDisabledButton(formValue);
        if (formValue.isAutoSave) {
            save();
        }
    }

    // input要素の変更時
    $('#datetimeStart').change(calculate);
    $('#datetimeEnd').change(calculate);
    $('#datetimeNow').change(() => {
        $('#isNow').prop('checked', true);
        if ($('#datetimeNow').val() !== dayjs().format('YYYY-MM-DDTHH:mm')) {
            $('#isNow').prop('checked', false);
        }
        calculate();
    });
    $('#isNow').change(calculate);
    $('#targetEnd').change(calculate);
    $('#stamina').change(calculate);
    $('#myPoint').change(calculate);
    $('#gauge').change(calculate);
    $('#kizuna').change(calculate);
    $('#mission').change(calculate);
    $('#missionKizuna').change(calculate);
    $('[name="showCourse"]').change(() => {
        $('#showCourse-all').prop('checked', true);
        $('[name="showCourse"]').each((i) => {
            if (!$('[name="showCourse"]').eq(i).prop('checked')) {
                $('#showCourse-all').prop('checked', false);
            }
        });
        calculate();
    });
    $('#showCourse-all').change(() => {
        $('[name="showCourse"]').each((i) => {
            $('[name="showCourse"]').eq(i).prop('checked', $('#showCourse-all').prop('checked'));
        });
        calculate();
    });
    $('#update').click(calculate);
    $('#autoSave').change(calculate);

    // 回数増減ボタン
    $('.beforeUseKizuna').click(() => {
        const formValue = getFormValue();

        $('#kizuna').val(formValue.kizuna + 1);
        $('#gauge').val(formValue.gauge - 100);

        calculate();
    });
    $('.afterUseKizuna').click(() => {
        const formValue = getFormValue();

        $('#kizuna').val(formValue.kizuna - 1);
        $('#gauge').val(formValue.gauge + 100);

        calculate();
    });
    $('.beforeClearMission').click(() => {
        const formValue = getFormValue();

        $('#missionKizuna').val(formValue.missionKizuna + 1);
        $('#kizuna').val(formValue.kizuna - 1);

        calculate();
    });
    $('.afterClearMission').click(() => {
        const formValue = getFormValue();

        $('#missionKizuna').val(formValue.missionKizuna - 1);
        $('#kizuna').val(formValue.kizuna + 1);

        calculate();
    });
    $('.beforePlayPromotion').click(function () {
        // eslint-disable-next-line no-invalid-this
        const course = $(this).val();
        const formValue = getFormValue();
        const isWork = course.indexOf('work') !== -1;

        $('#stamina').val(formValue.stamina + staminaCost[course]);
        $('#myPoint').val(formValue.myPoint - points[course]);
        $('#gauge').val(formValue.gauge - gauges[course]);
        if (isLoseKizuna(formValue.myPoint, points[course])) {
            $('#kizuna').val(formValue.kizuna - 1);
        }
        if (!isWork) {
            $('#mission').val(formValue.mission + 1);
        }

        calculate();
    });
    $('.afterPlayPromotion').click(function () {
        // eslint-disable-next-line no-invalid-this
        const course = $(this).val();
        const formValue = getFormValue();
        const isWork = course.indexOf('work') !== -1;

        $('#stamina').val(formValue.stamina - staminaCost[course]);
        $('#myPoint').val(formValue.myPoint + points[course]);
        $('#gauge').val(formValue.gauge + gauges[course]);
        if (isGetKizuna(formValue.myPoint, points[course])) {
            $('#kizuna').val(formValue.kizuna + 1);
        }
        if (!isWork) {
            $('#mission').val(formValue.mission - 1);
        }

        calculate();
    });
    $('.beforePlayEvent').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina + eventStaminaCost);
        $('#myPoint').val(formValue.myPoint - eventPoints);
        $('#gauge').val(formValue.gauge + 100);
        if (isLoseKizuna(formValue.myPoint, eventPoints)) {
            $('#kizuna').val(formValue.kizuna - 1);
        }
        $('#mission').val(formValue.mission + 1);

        calculate();
    });
    $('.afterPlayEvent').click(() => {
        // eslint-disable-next-line no-invalid-this
        const formValue = getFormValue();

        $('#stamina').val(formValue.stamina - eventStaminaCost);
        $('#myPoint').val(formValue.myPoint + eventPoints);
        $('#gauge').val(formValue.gauge - 100);
        if (isGetKizuna(formValue.myPoint, eventPoints)) {
            $('#kizuna').val(formValue.kizuna + 1);
        }
        $('#mission').val(formValue.mission - 1);

        calculate();
    });

    // 保存ボタン
    $('#save').click(save);

    // 入力を初期化ボタン
    function defaultInput() {
        $('#datetimeStart').val(dayjs().subtract(15, 'h').format('YYYY-MM-DDT15:00'));
        $('#datetimeEnd').val(dayjs().subtract(15, 'h').add(1, 'w').format('YYYY-MM-DDT20:59'));
        $('#datetimeNow').val(dayjs().format('YYYY-MM-DDTHH:mm'));
        $('#isNow').prop('checked', true);
        $('#targetEnd').val(30000);
        $('#stamina').val(0);
        $('#myPoint').val(0);
        $('#gauge').val(0);
        $('#kizuna').val(0);
        $('#mission').val(30);
        $('#missionKizuna').val(5);
        $('[name="showCourse"]').each((i) => {
            if (
                ['_2m_live3', '_2m_live', '_4m_live3', '_4m_live', '_6m_live3', '_6m_live', '_mm_live3', '_mm_live'].indexOf(
                    $('[name="showCourse"]').eq(i).val()
                ) !== -1
            ) {
                $('[name="showCourse"]').eq(i).prop('checked', true);
            } else {
                $('[name="showCourse"]').eq(i).prop('checked', false);
            }
        });
        $('#showCourse-all').prop('checked', false);
        $('#autoSave').prop('checked', false);

        calculate();
    }
    $('#clearInput').click(defaultInput);

    // 保存した値を読込ボタン
    function loadSavedData() {
        const savedString = localStorage.getItem(location.href.replace('index.html', ''));

        if (!savedString) {
            return false;
        }

        const savedData = JSON.parse(savedString);

        $('#datetimeStart').val(savedData.datetimeStart);
        $('#datetimeEnd').val(savedData.datetimeEnd);
        $('#datetimeNow').val(savedData.datetimeNow);
        $('#isNow').prop('checked', savedData.isNow);
        $('#targetEnd').val(savedData.targetEnd);
        $('#stamina').val(savedData.stamina);
        $('#myPoint').val(savedData.myPoint);
        $('#gauge').val(savedData.gauge);
        $('#kizuna').val(savedData.kizuna);
        $('#mission').val(savedData.mission);
        $('#missionKizuna').val(savedData.missionKizuna);
        $('#showCourse-all').prop('checked', true);
        $('[name="showCourse"]').each((i) => {
            if (savedData.showCourse.indexOf($('[name="showCourse"]').eq(i).val()) !== -1) {
                $('[name="showCourse"]').eq(i).prop('checked', true);
            } else {
                $('[name="showCourse"]').eq(i).prop('checked', false);
                $('#showCourse-all').prop('checked', false);
            }
        });
        $('#autoSave').prop('checked', savedData.autoSave);

        calculate();

        $('#datetimeSave').text(savedData.datetimeSave);
        $('#loadSave').prop('disabled', false);
        $('#clearSave').prop('disabled', false);

        return true;
    }
    $('#loadSave').click(loadSavedData);

    // 保存した値を削除ボタン
    $('#clearSave').click(() => {
        localStorage.removeItem(location.href.replace('index.html', ''));

        $('#datetimeSave').text('削除済');
        $('#loadSave').prop('disabled', true);
        $('#clearSave').prop('disabled', true);
    });

    // 画面表示時に保存した値を読込、保存した値がなければ入力の初期化
    if (!loadSavedData()) {
        defaultInput();
    }
})();
