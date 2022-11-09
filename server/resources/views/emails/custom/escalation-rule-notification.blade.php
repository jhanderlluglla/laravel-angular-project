@extends('emails.default.base')

@section('content')
    <div style=" font-family: 'Century Gothic',Verdana,Arial,sans-serif; font-size: 13px;  color:#1b1d1e;">
        <p>Hi there,</p>
  		<table width="100%" cellpadding="0" cellspacing="0" border="0">
			<thead>
				<tr style="font-size: 14px;">
					<th>Id</th>
					<th>Category</th>
					<th>Status</th>
					<th>Stage</th>
					<th>Priority</th>
					<th>Minutes</th>
				</tr>
			</thead>
			<tbody>
				@foreach ($escalation->getTickets() as $tt)
				<tr style="text-align: center;">
					<td>
						<a href="{{url('help-center/tickets/'.$tt->id)}}">AP{{ $tt->id }}</a>
					</td>
					<td>
						{{$tt->getCategoryNames() }}
					</td>
					<td>{{ $tt->getStatusAttribute() }}</td>
					<td>{{  $escalation->stage->name }}</td>
					<td>{{  $escalation->priority->name }}</td>
					<td>{{ $escalation->minutes }}</td>
				</tr>
				@endforeach
			</tbody>
	    </table>
        <p>In the meantime, you can search our <a href="{{url('help-center')}}">Help Center</a></p>

        <p>Kind Regards<br>{{$siteName}} Help Team</p>
    </div>
@endsection