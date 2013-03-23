

assemblies = bone.data('assemblies')

bone.view 'data_table',
    selector: '.data-table'
    refresh: (data, event, root) ->
        root.html ''
        for row in data
            root.append Template.data_row row
    
bone.interface 'data_table_input',
    selector: '.data-table',

    # Sort
    'click th[data-name]', (event, root, target) ->
        sort = target.attr('data-sort')
        assemblies.emit 'get-assemblies', sort: sort

assemblies.incoming
    tableData: (data, meta) ->
        @views('data_table').refresh data
        
