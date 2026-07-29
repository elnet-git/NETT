import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../../core/routes/app_routes.dart';
import '../../../core/theme/app_colors.dart';
import '../widgets/auth_button.dart';
import '../widgets/auth_text_field.dart';


class LoginScreen extends StatefulWidget {

  const LoginScreen({
    super.key,
  });


  @override
  State<LoginScreen> createState() =>
      _LoginScreenState();

}



class _LoginScreenState extends State<LoginScreen> {


  final emailController = TextEditingController();

  final passwordController = TextEditingController();


  bool obscurePassword = true;



  @override
  void dispose() {

    emailController.dispose();

    passwordController.dispose();

    super.dispose();

  }



  @override
  Widget build(BuildContext context) {

    return Scaffold(

      backgroundColor: AppColors.background,


      body: SafeArea(

        child: SingleChildScrollView(

          padding: const EdgeInsets.all(30),


          child: Column(

            crossAxisAlignment:
                CrossAxisAlignment.center,


            children: [


              const SizedBox(
                height: 40,
              ),



              const Icon(

                Icons.location_on,

                size: 90,

                color: AppColors.primary,

              ),



              const SizedBox(
                height: 20,
              ),



              const Text(

                "NETTMI",

                style: TextStyle(

                  fontSize: 36,

                  fontWeight: FontWeight.bold,

                  color: AppColors.primary,

                ),

              ),



              const SizedBox(
                height: 10,
              ),



              const Text(

                "Bienvenido de nuevo",

                style: TextStyle(

                  fontSize: 18,

                  color: AppColors.textSecondary,

                ),

              ),



              const SizedBox(
                height: 40,
              ),



              AuthTextField(

                hint: "Correo electrónico",

                icon: Icons.email_outlined,

                controller: emailController,

              ),



              const SizedBox(
                height: 20,
              ),



              TextField(

                controller: passwordController,

                obscureText: obscurePassword,


                decoration: InputDecoration(

                  hintText: "Contraseña",

                  prefixIcon:
                      const Icon(Icons.lock_outline),


                  suffixIcon: IconButton(

                    icon: Icon(

                      obscurePassword

                          ? Icons.visibility_off

                          : Icons.visibility,

                    ),


                    onPressed: () {

                      setState(() {

                        obscurePassword =
                            !obscurePassword;

                      });

                    },

                  ),


                  border: OutlineInputBorder(

                    borderRadius:
                        BorderRadius.circular(15),

                  ),

                ),

              ),



              const SizedBox(
                height: 15,
              ),



              Align(

                alignment:
                    Alignment.centerRight,


                child: TextButton(

                  onPressed: () {

                    context.push(
                      AppRoutes.forgotPassword,
                    );

                  },


                  child: const Text(
                    "¿Olvidaste tu contraseña?",
                  ),

                ),

              ),



              const SizedBox(
                height: 10,
              ),



              AuthButton(

                text: "Ingresar",

                onPressed: () {

                  // Aquí conectaremos JWT después

                },

              ),



              const SizedBox(
                height: 20,
              ),



              Row(

                mainAxisAlignment:
                    MainAxisAlignment.center,


                children: [


                  const Text(
                    "¿No tienes cuenta?",
                  ),


                  TextButton(

                    onPressed: () {

                      context.push(
                        AppRoutes.register,
                      );

                    },


                    child: const Text(
                      "Crear cuenta",
                    ),

                  ),


                ],

              ),



            ],

          ),

        ),

      ),

    );

  }

}