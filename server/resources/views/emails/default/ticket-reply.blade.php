@extends('emails.default.base')

@section('content')
    @foreach($ticket->latest_replies as $latestReply)
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
                <td width="100%" style="padding: 15px 0; border-bottom: 1px dotted #c5c5c5;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style=" table-layout:fixed;">
                        <tr>
                            <td valign="top" style="padding: 0 15px 0 15px;width: 40px;">
                                <img alt="user avatar" height="40" width="40" src="{{$latestReply->user->avatar}}" style="height: auto; line-height: 100%; outline: none; text-decoration: none; border-radius: 5px;"/>
                            </td>
                            <td width="100%" style="padding: 0; margin: 0;" valign="top">
                                <p style="font-family: 'Lucida Grande','Lucida Sans Unicode','Lucida Sans',Verdana,Tahoma,sans-serif; font-size: 15px; line-height: 18px; margin-bottom: 0; margin-top: 0; padding: 0; color:#1b1d1e;">
                                    {{$latestReply->user->display_name}}
                                </p>
                                <p style=" line-height: 25px; margin-bottom: 15px; margin-top: 0; padding: 0; color:#bbbbbb;">
                                    {{$latestReply->created_at_formatted}}
                                </p>
                                <div style="color: #2b2e2f; font-family: 'Lucida Sans Unicode', 'Lucida Grande', 'Tahoma', Verdana, sans-serif; font-size: 14px; line-height: 22px; margin: 15px 0">
                                    {!!$latestReply->body!!}
                                    <br/>
                                </div>
                                <p></p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
        <div class="signature" style="margin-top: 25px">
            <div style="height: 65px;"><img src="/apr.png" style="float: left;"><p style="padding-top:12px;padding-left:5px;float:left;">Africa Prudential</p></div>
            <p class="company" style=" line-height: 25px; margin-bottom: 0; margin-top: 0; padding: 0; color:#bbbbbb;">Africa Prudential</p>
            <p class="currentuser-name" style=" line-height: 25px; margin-bottom: 0; margin-top: 0; padding: 0; color:#bbbbbb;">{{$latestReply->user->display_name}}</p>
            <p style=" line-height: 25px; margin-bottom: 20px; margin-top: 0; padding: 0; color:#bbbbbb;">>Customer Service Fulfillment Officer</p>
            <p class="company" style=" line-height: 25px; margin-bottom: 0px; margin-top: 0; padding: 0; color:#bbbbbb;">Africa Prudential Plc</p>
            <p style=" line-height: 25px; margin-bottom: 15px; margin-top: 0; padding: 0; color:#bbbbbb;">220B, Ikorodu Road, Palmgrove</p>
            <p style=" line-height: 25px; margin-bottom: 15px; margin-top: 0; padding: 0; color:#bbbbbb;">Lagos - Nigeria</p>
            <p style=" line-height: 25px; margin-bottom: 15px; margin-top: 0; padding: 0; color:#bbbbbb;">P:  +234-7080606400, +234-7080606417</p>
            <p class="email" style=" line-height: 25px; margin-bottom: 0; margin-top: 0; padding: 0; color:#bbbbbb;">>E: {{$latestReply->user->email}}</p>
            <p class="website" style=" line-height: 25px; margin-bottom: 0px; margin-top: 0; padding: 0; color:#bbbbbb;">><a href="http://www.africaprudential.com">www.africaprudential.com</a></p>
            <ul class="social" style="padding: 0; margin-top: 10px;">
                <li style="display: inline-block; padding: 0 15px; border-right: solid 1px #777;"><a href="#">Twitter</a></li>
                <li style="display: inline-block; border-right: solid 1px #777;"><a href="#">Facebook</a></li>
                <li style="display: inline-block; border-right: solid 1px #777;"><a href="#">Instagram</a></li>
                <li style="display: inline-block;"><a href="#">Africapitalism</a></li>
            </ul>
        </div>
        <p></p>
    @endforeach

    <span style="color: #FFFFFF">{{$reference}}</span>
@endsection