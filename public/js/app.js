angular.module('appSliu', [])
    .factory('factoryIcons', function ($http) {
        return {
            getIconsAsync: function (model) {
                model.iconGroups = [{
                    name: 'loading',
                    files: []
                }];

                $http({
                    method: 'GET',
                    url: 'icons.json'
                }).then(function successCallback(response) {
                    model.iconGroups = response.data;

                    _.each(model.iconGroups, function (iconGroup) {
                        iconGroup.show = model.iconGroupsShow;
                    });
                }, function errorCallback(response) {
                    console.error(response);

                    model.iconGroups = [{
                        name: 'error',
                        files: []
                    }]
                });
            }
        };
    })
    .controller('ctrlMain', function ($scope, $http, factoryIcons) {
        $scope.refreshIcons = function () {
            factoryIcons.getIconsAsync($scope.model);
        };

        $scope.app = {
            title: 'Streamline Icons Ultimate'
        };

        $scope.model = {
            query: {
                groups: '',
                icons: ''
            },
            iconSize: 'svg-icon-preview-48',
            iconGroups: [{
                name: 'initial',
                files: []
            }],
            iconGroupsShow: true,
            selectedIcons: [],
            lastSelection: {
                group: false,
                idx: false
            }
        };

        $scope.toggleShow = function () {
            $scope.model.iconGroupsShow = !$scope.model.iconGroupsShow;

            _.each($scope.model.iconGroups, function (iconGroup) {
                iconGroup.show = $scope.model.iconGroupsShow;
            });
        };

        $scope.toggleSelected = function (iconGroup, icon, currIdx, $event) {
            icon.selected = !icon.selected;

            if (icon.selected) {
                if ($scope.model.selectedIcons.indexOf(icon) < 0) {
                    $scope.model.selectedIcons.push(icon);
                }
            } else {
                let idxSplice = $scope.model.selectedIcons.indexOf(icon);

                if (idxSplice >= 0) {
                    $scope.model.selectedIcons.splice(idxSplice, 1);
                }
            }

            if ($event.shiftKey) {
                if ($scope.model.lastSelection.idx !== false) {
                    if ($scope.model.lastSelection.group == iconGroup.name
                        && currIdx != $scope.model.lastSelection.idx) {
                        let idx,
                            idxFrom = currIdx < $scope.model.lastSelection.idx ? currIdx : $scope.model.lastSelection.idx,
                            idxTo = currIdx > $scope.model.lastSelection.idx ? currIdx : $scope.model.lastSelection.idx;

                        for (idx = idxFrom; idx <= idxTo && idx < iconGroup.icons.length; idx++) {
                            iconGroup.icons[idx].selected = icon.selected;

                            if (icon.selected) {
                                if ($scope.model.selectedIcons.indexOf(iconGroup.icons[idx]) < 0) {
                                    $scope.model.selectedIcons.push(iconGroup.icons[idx]);
                                }
                            } else {
                                let idxSplice = $scope.model.selectedIcons.indexOf(iconGroup.icons[idx]);

                                if (idxSplice >= 0) {
                                    $scope.model.selectedIcons.splice(idxSplice, 1);
                                }
                            }
                        }
                    }
                }
            }

            $scope.model.lastSelection = {
                group: iconGroup.name,
                idx: currIdx
            };
        };

        $scope.shouldShowIcon = function (icon) {
            return $scope.model.filter == ''
                || icon.group.indexOf($scope.model.filter) >= 0
                || icon.name.indexOf($scope.model.filter) >= 0;
        };

        $scope.importSelectedIcons = function () {
            var data = prompt('Please paste your json-data here:');

            if (data != null) {
                try {
                    data = JSON.parse(data);

                    data = _.groupBy(data, 'group');

                    var selectedIcons = [];

                    _.mapObject(data, function (icons, group) {
                        icons = _.map(icons, function (icon) {
                            if (!icon.name) console.warn(icon);
                            return icon.name;
                        });
                        _.each(_.filter($scope.model.iconGroups, function (iconGroup) {
                            return iconGroup.name == group;
                        }), function (iconGroup) {
                            selectedIcons = selectedIcons.concat(_.filter(iconGroup.icons, function (icon) {
                                return icons.indexOf(icon.name) >= 0;
                            }));
                        });
                    });

                    _.each(selectedIcons, function (icon) {
                        icon.selected = true;
                    });

                    $scope.model.selectedIcons = selectedIcons;
                } catch (ex) {
                    console.error(ex);

                    alert('Could not load your json-data!');
                }
            }
        };

        $scope.exportSelectedIcons = function () {
            var data = _.map($scope.model.selectedIcons, function (icon) {
                return {
                    group: icon.group,
                    name: icon.name
                };
            });

            data = JSON.stringify(data);

            try {
                window.open('data:application/json;charset=utf-8,' + escape(data));
            } catch (ex) {
                console.error(ex, data);

                alert('Could not export your json-data, sorry!');
            }
        };

        $scope.clearSelectedIcons = function () {
          if (confirm('Do you really want to clear your selection?')) {
              _.each($scope.model.selectedIcons, function (icon) {
                  icon.selected = false;
              });

              $scope.model.selectedIcons = [];
          }
        };

        $scope.generateSelectedIcons = function () {
            var cbError = function cbError(response) {
                console.error(response);

                alert('Could not generate your svg-files, sorry!');
            };

            $http({
                method: 'POST',
                url: '/generate',
                data: _.map($scope.model.selectedIcons, function (icon) {
                    return {
                        group: icon.group,
                        name: icon.name
                    };
                })
            }).then(function cbSuccess(response) {
                if (response.data && response.data.success) {
                    if (response.data.generatedFile) {
                        location.href = response.data.generatedFile;
                    }
                } else {
                    cbError(response);
                }
            }, cbError);
        };

        $scope.refreshIcons();
    });

// bad practice
var svgSelectedPreview = document.getElementById('svg-selected-preview'),
    svgSelectedPreviewOffsetTop = svgSelectedPreview.offsetTop,
    refreshSvgSelectedPreviewPlaceholder = function () {
        document.getElementById('svg-selected-preview-placeholder').style.minHeight
            = svgSelectedPreview.clientHeight + 'px';
    };

window.onload = function () {
    refreshSvgSelectedPreviewPlaceholder();
};

window.onscroll = function (event) {
    if (window.scrollY > svgSelectedPreviewOffsetTop) {
        svgSelectedPreview.classList.add('fixed');
    } else {
        svgSelectedPreview.classList.remove('fixed');
    }
};